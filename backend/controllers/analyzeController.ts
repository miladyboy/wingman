import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import { supabaseAdmin } from "../services/supabaseService";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import {
  getNicknamePrompt,
  getImageDescriptionAndNicknamePrompt,
} from "../prompts/nicknamePrompts";
import {
  getFallbackImageAnalysisPrompt,
  getImageDescriptionPrompt,
} from "../prompts/userPrompt";
import { buildFullPrompt } from "../prompt-builder";
import type { IntentMode, Stage } from "../prompt-builder/types";
import { runCritiqueAgent } from "../prompt-builder/runCritiqueAgent";
import { uploadFilesToStorage } from "../services/imageUploadService";
import { getPreferences, UserPrefs } from "../services/userService";
import type { SimpPreference } from "../types/user";
import { UploadedFile, ImageRecord } from "../services/imageUploadService";

const openaiApiKey = process.env.OPENAI_API_KEY as string;
const openaiClient = new OpenAIService(openaiApiKey);

/**
 * Strips surrounding quotes from a string if present.
 * Handles both single and double quotes.
 * @param text The text to strip quotes from
 * @returns The text without surrounding quotes
 */
function stripQuotes(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();

  // Remove surrounding double quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }

  // Remove surrounding single quotes
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

// Type definitions
interface AnalyzeRequestBody {
  historyJson?: string;
  newMessageText?: string;
  conversationId?: string;
  isDraft?: string | boolean;
  stage?: string;
}

interface MessageRecord {
  id: string;
  conversation_id: string;
  sender: string;
  content: string | null;
  image_description?: string;
}

function parseAnalyzeRequest(req: Request): {
  history: any[];
  newMessageText: string;
  conversationId: string;
  files: UploadedFile[];
  isDraft: boolean;
  stage: Stage;
} {
  const { historyJson, newMessageText, conversationId, isDraft, stage } =
    (req.body || {}) as AnalyzeRequestBody;
  let history: any[] = [];
  try {
    history = historyJson ? JSON.parse(historyJson) : [];
  } catch {
    throw new Error("Invalid history JSON");
  }
  if (
    typeof newMessageText === "undefined" ||
    !conversationId ||
    typeof isDraft === "undefined"
  ) {
    throw new Error("newMessageText, conversationId, and isDraft are required");
  }

  const parsedIsDraft = isDraft === true || isDraft === "true";

  // If stage is provided, validate it; otherwise infer it
  let finalStage: Stage;
  if (typeof stage !== "undefined") {
    // Validate that stage is a valid Stage value
    if (!["Opening", "Continue", "ReEngage"].includes(stage)) {
      throw new Error("stage must be one of: Opening, Continue, ReEngage");
    }
    finalStage = stage as Stage;
  } else {
    // Infer stage from history and draft status
    finalStage = inferStage(history, parsedIsDraft);
  }

  const files: UploadedFile[] = (req.files as UploadedFile[]) || [];
  return {
    history,
    newMessageText,
    conversationId,
    files,
    isDraft: parsedIsDraft,
    stage: finalStage,
  };
}

/**
 * Infers the conversation stage based on history and draft status.
 * - If no history, it's an Opening.
 * - If isDraft, assume Continue.
 * - If last message is from user, assume ReEngage.
 * - Otherwise, Continue.
 */
function inferStage(history: any[], isDraft: boolean): Stage {
  if (isDraft) return "Continue";
  if (!history || history.length === 0) return "Opening";
  const lastMsg = history[history.length - 1];
  if (lastMsg && (lastMsg.sender === "user" || lastMsg.role === "user"))
    return "ReEngage";
  return "Continue";
}

async function saveMessageStub(
  supabase: any,
  conversationId: string,
  newMessageText: string
): Promise<MessageRecord> {
  const messageData = {
    conversation_id: conversationId,
    sender: "user",
    content: newMessageText || null,
  };
  const { data: newMessageRecord, error: messageError } = await supabase!
    .from("messages")
    .insert(messageData)
    .select()
    .single();
  if (messageError) {
    if (messageError.code === "23503") {
      throw new Error(
        `Invalid conversation ID: ${conversationId}. Cannot save message.`
      );
    }
    throw new Error(`Failed to save message stub: ${messageError.message}`);
  }
  return newMessageRecord as MessageRecord;
}

async function saveImageRecords(
  supabase: any,
  imageRecords: ImageRecord[]
): Promise<void> {
  if (imageRecords.length > 0) {
    const { error: imageDbError } = await supabase!
      .from("ChatMessageImages")
      .insert(imageRecords);
    if (imageDbError) {
      throw new Error(
        "Failed to save image references: " + imageDbError.message
      );
    }
  }
}

async function generateNickname(
  newMessageText: string,
  openaiInstance: OpenAIService = openaiClient
): Promise<string> {
  // Get the nickname prompt as a structured message
  const nicknamePromptMessage = getNicknamePrompt(newMessageText);
  // Create the messages array with just the user message
  const nicknamePrompt: ChatCompletionMessageParam[] = [nicknamePromptMessage];

  const result = await openaiInstance.callOpenAI(nicknamePrompt, 20);
  const nickname = stripQuotes(result.trim());
  if (!nickname) return "Chat Pal";
  return nickname;
}

async function generateImageDescriptionAndNickname(
  finalUserMessageContent: any[],
  openaiInstance: OpenAIService = openaiClient
): Promise<{ nickname: string; imageDescription: string }> {
  // Revert to Node SDK-supported types for OpenAI Vision API
  const descriptionPromptContent = finalUserMessageContent.map((item) => {
    if (item.type === "text") {
      return { type: "input_text", text: item.text };
    } else if (item.type === "image_url") {
      return { type: "input_image", image_url: item.image_url.url };
    } else if (item.type === "input_text" || item.type === "input_image") {
      return item;
    }
    return item;
  });
  const prompt = getImageDescriptionAndNicknamePrompt();
  const promptText =
    typeof prompt.content === "string"
      ? prompt.content
      : "Please describe the image.";
  descriptionPromptContent.unshift({ type: "input_text", text: promptText });
  const descriptionPrompt: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: descriptionPromptContent as any,
    },
  ];
  const descriptionAndNickname = await openaiInstance.callOpenAI(
    descriptionPrompt,
    250
  );
  console.log(
    "[VisionAPI] Raw response from generateImageDescriptionAndNickname:",
    descriptionAndNickname
  );
  let nickname = "";
  let imageDescription = "";
  const lines = (descriptionAndNickname || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  console.log("[VisionAPI][Parser] Split lines:", lines);
  // 1. Buscar línea con prefijo Nickname (cualquier casing, espacios):
  let nicknameLineIdx = lines.findIndex((line) => /^nickname\s*:/i.test(line));
  if (nicknameLineIdx !== -1) {
    nickname = stripQuotes(
      lines[nicknameLineIdx].replace(/^nickname\s*:/i, "").trim()
    );
    imageDescription = lines
      .filter((_, idx) => idx !== nicknameLineIdx)
      .join("\n");
    console.log(
      "[VisionAPI][Parser] Nickname by prefix:",
      nickname,
      "| Description:",
      imageDescription
    );
  } else if (lines.length > 1) {
    // 2. Si la última línea es corta (menos de 8 palabras), es nickname
    const lastLine = lines[lines.length - 1];
    if (lastLine.split(" ").length <= 8) {
      nickname = stripQuotes(lastLine);
      imageDescription = lines.slice(0, -1).join("\n");
      console.log(
        "[VisionAPI][Parser] Nickname by last line:",
        nickname,
        "| Description:",
        imageDescription
      );
    } else {
      // Si la última línea es larga, probablemente toda la respuesta es descripción
      nickname = "";
      imageDescription = lines.join("\n");
      console.log(
        "[VisionAPI][Parser] All lines as description:",
        imageDescription
      );
    }
  } else if (lines.length === 1) {
    // 3. Solo una línea: si es larga (más de 8 palabras), es descripción
    const onlyLine = lines[0];
    if (onlyLine.split(" ").length > 8) {
      imageDescription = onlyLine;
      nickname = "";
      console.log(
        "[VisionAPI][Parser] Single long line as description:",
        imageDescription
      );
    } else {
      nickname = stripQuotes(onlyLine);
      imageDescription = "";
      console.log(
        "[VisionAPI][Parser] Single short line as nickname:",
        nickname
      );
    }
  }
  // 4. Fallbacks y validaciones
  if (!imageDescription || imageDescription.toLowerCase().includes("nickname"))
    imageDescription = "";
  if (!imageDescription) imageDescription = "Image(s) received.";
  if (!nickname || nickname.toLowerCase().includes("description"))
    nickname = "Chat Pal";
  console.log(
    "[VisionAPI][Parser] Final nickname:",
    nickname,
    "| Final description:",
    imageDescription
  );
  return { nickname, imageDescription };
}

async function generateImageDescription(
  finalUserMessageContent: any[],
  openaiInstance: OpenAIService = openaiClient
): Promise<string> {
  // Revert to Node SDK-supported types for OpenAI Vision API
  const descPromptContentSubsequent = finalUserMessageContent.map((item) => {
    if (item.type === "text") {
      return { type: "input_text", text: item.text };
    } else if (item.type === "image_url") {
      return { type: "input_image", image_url: item.image_url.url };
    } else if (item.type === "input_text" || item.type === "input_image") {
      return item;
    }
    return item;
  });
  const prompt = getImageDescriptionPrompt();
  const promptText =
    typeof prompt.content === "string"
      ? prompt.content
      : "Please describe the image.";
  descPromptContentSubsequent.unshift({ type: "input_text", text: promptText });
  const descriptionPromptSubsequent: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: descPromptContentSubsequent as any,
    },
  ];
  try {
    console.log(
      "[DEBUG][OpenAI] Payload enviado para descripción de imagen:",
      JSON.stringify(descriptionPromptSubsequent, null, 2)
    );
    let generatedImageDescription = await openaiInstance.callOpenAI(
      descriptionPromptSubsequent,
      250
    );
    console.log(
      "[DEBUG][OpenAI] Respuesta cruda de OpenAI para descripción de imagen:",
      generatedImageDescription
    );
    if (!generatedImageDescription || !generatedImageDescription.trim()) {
      console.warn(
        "[DEBUG][OpenAI] Fallback activado: OpenAI devolvió respuesta vacía para descripción de imagen."
      );
      return "Image(s) analyzed.";
    }
    return generatedImageDescription.trim();
  } catch (err) {
    console.error(
      "[DEBUG][OpenAI] Error al obtener descripción de imagen de OpenAI:",
      err
    );
    return "Error analyzing image(s).";
  }
}

async function updateMessageWithImageDescription(
  supabase: any,
  messageId: string,
  imageDescription: string
): Promise<boolean> {
  const { error: updateError } = await supabase!
    .from("messages")
    .update({ image_description: imageDescription })
    .eq("id", messageId);
  return !updateError;
}

async function generateSuggestions(
  conversation: any[],
  openaiInstance: OpenAIService = openaiClient
): Promise<string[]> {
  const suggestionText = await openaiInstance.callOpenAI(conversation, 300);
  // Split by double newline or single newline
  let suggestions = suggestionText
    .split(/\n\n|\n/)
    .map((s) => {
      let trimmed = s.trim();
      // Remove list markers: 1. 2. * - etc. (with optional spaces)
      trimmed = trimmed.replace(/^(\d+\.|[-*])\s*/, "");
      return trimmed;
    })
    .map((s) => s.trim())
    .filter((s) => s.length > 5 && s.length < 500);
  return suggestions;
}

/**
 * Generates a nickname using both the user message and the image description.
 * @param userMessage The user's message text
 * @param imageDescription The image description (if any)
 * @param openaiInstance Optional OpenAIService instance
 */
async function generateNicknameWithImageDescription(
  userMessage: string,
  imageDescription: string,
  openaiInstance: OpenAIService = openaiClient
): Promise<string> {
  const prompt = `Based on the following message and image description, invent a short, playful, SFW nickname for the subject described.\nMessage: "${userMessage}"\nImage Description: "${imageDescription}"\nNickname:`;
  const nicknamePrompt: ChatCompletionMessageParam[] = [
    { role: "user", content: prompt },
  ];
  const result = await openaiInstance.callOpenAI(nicknamePrompt, 20);
  const nickname = stripQuotes(result.trim());
  if (!nickname) return "Chat Pal";
  return nickname;
}

export async function analyze(req: Request, res: Response): Promise<void> {
  try {
    // --- Auth Payload from middleware ---
    const userId = req.auth?.userId;
    if (!userId) {
      res
        .status(401)
        .json({ error: "Unauthorized: user authentication required." });
      return;
    }

    // --- Fetch User Preferences ---
    let userPreferences = "";
    let preferredCountry = "auto";
    let simpPreference: SimpPreference = "auto";
    try {
      const prefs: UserPrefs = await getPreferences(userId);
      userPreferences = prefs.text;
      preferredCountry = prefs.preferredCountry;
      simpPreference = prefs.simpPreference;
    } catch (prefErr) {
      // Log but do not block the request
      console.warn(
        "Failed to fetch user preferences via userService:",
        prefErr
      );
    }

    // --- Extract Text and Files ---
    let history: any[],
      newMessageText: string,
      conversationId: string,
      files: UploadedFile[],
      isDraft: boolean,
      extractedStage: Stage;
    try {
      ({
        history,
        newMessageText,
        conversationId,
        files,
        isDraft,
        stage: extractedStage,
      } = parseAnalyzeRequest(req));
      console.log("[Analyze] Parsed request:", {
        history,
        newMessageText,
        conversationId,
        isDraft,
        stage: extractedStage,
        files: files.map((f) => ({
          name: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
        })),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
      console.error("[Analyze] Error parsing request:", err);
      return;
    }

    if (!supabaseAdmin) {
      res
        .status(500)
        .json({ error: "Backend Supabase client not configured." });
      console.error("[Analyze] Supabase client not configured");
      return;
    }

    let savedMessage: MessageRecord | null = null;
    let imageRecords: ImageRecord[] = [];
    let imageUrlsForOpenAI: string[] = [];
    let imageUrlsForFrontend: string[] = [];

    // --- Save the Message Stub (without AI response yet) ---
    try {
      savedMessage = await saveMessageStub(
        supabaseAdmin,
        conversationId,
        newMessageText
      );
      console.log("[Analyze] Saved message stub:", savedMessage);
      // Update conversation's last_message_at to the new message's created_at
      if (savedMessage && savedMessage.id) {
        // Fetch the created_at timestamp of the new message
        const { data: msgData, error: msgError } = await supabaseAdmin
          .from("messages")
          .select("created_at")
          .eq("id", savedMessage.id)
          .single();
        if (!msgError && msgData && msgData.created_at) {
          await supabaseAdmin
            .from("conversations")
            .update({ last_message_at: msgData.created_at })
            .eq("id", conversationId);
          console.log(
            "[Analyze] Updated conversation last_message_at:",
            msgData.created_at
          );
        }
      }
    } catch (dbError: any) {
      res.status(500).json({
        error: "Database operation failed.",
        details: dbError.message,
      });
      console.error("[Analyze] Error saving message stub:", dbError);
      return;
    }

    // --- Upload Files to Supabase Storage & Prepare Records ---
    if (files.length > 0 && savedMessage) {
      const uploadResult = await uploadFilesToStorage(
        supabaseAdmin,
        files,
        savedMessage,
        userId
      );
      imageRecords = uploadResult.imageRecords;
      imageUrlsForOpenAI = uploadResult.imageUrlsForOpenAI;
      imageUrlsForFrontend = uploadResult.imageUrlsForFrontend;
      console.log("[Analyze] Uploaded images:", {
        imageRecords,
        imageUrlsForOpenAI,
        imageUrlsForFrontend,
      });
      try {
        await saveImageRecords(supabaseAdmin, imageRecords);
        console.log("[Analyze] Saved image records to DB");
      } catch (imageDbError: any) {
        res.status(500).json({ error: imageDbError.message });
        console.error("[Analyze] Error saving image records:", imageDbError);
        return;
      }
    }

    // --- Prepare for OpenAI Analysis ---
    let generatedNickname: string | null = null;
    let generatedImageDescription: string | null = null;
    let finalUserMessageContent: any[] = [];
    const isInitialUserMessage =
      !history ||
      history.filter((msg: any) => msg.role === "user").length === 0;
    let promptText = newMessageText;
    if (
      (!newMessageText || newMessageText.trim() === "") &&
      imageUrlsForOpenAI.length > 0
    ) {
      const fallbackPrompt = getFallbackImageAnalysisPrompt();
      promptText =
        typeof fallbackPrompt.content === "string"
          ? fallbackPrompt.content
          : "Please analyze these images.";
    }
    // Only add the user message if there are NO images; otherwise, skip it for Vision API
    if (
      imageUrlsForOpenAI.length === 0 &&
      promptText &&
      promptText.trim() !== ""
    ) {
      finalUserMessageContent.push({ type: "input_text", text: promptText });
    }
    if (imageUrlsForOpenAI.length > 0) {
      if (finalUserMessageContent.length === 0) {
        finalUserMessageContent.push({
          type: "input_text",
          text: "[Image(s) provided]",
        });
      }
      imageUrlsForOpenAI.forEach((url) => {
        finalUserMessageContent.push({
          type: "input_image",
          image_url: url,
        });
      });
    }
    console.log(
      "[Analyze] Final user message content for OpenAI:",
      finalUserMessageContent
    );
    if (isInitialUserMessage && finalUserMessageContent.length > 0) {
      if (imageUrlsForOpenAI.length > 0) {
        // 1. First call: get image description
        console.log(
          "[OpenAI] generateImageDescriptionAndNickname prompt:",
          JSON.stringify(finalUserMessageContent, null, 2)
        );
        const { imageDescription } = await generateImageDescriptionAndNickname(
          finalUserMessageContent
        );
        console.log("[OpenAI] imageDescription:", imageDescription);
        generatedImageDescription = imageDescription;
        // 2. Second call: generate nickname using user message and image description
        generatedNickname = await generateNicknameWithImageDescription(
          newMessageText,
          imageDescription
        );
        console.log("[OpenAI] generatedNickname:", generatedNickname);
      } else {
        // No images: fallback to old nickname logic
        console.log("[OpenAI] generateNickname prompt:", newMessageText);
        const nickname = await generateNickname(newMessageText);
        console.log("[OpenAI] generateNickname response:", nickname);
        generatedNickname = nickname;
      }
      // --- Set conversation title to nickname if generated ---
      if (generatedNickname && conversationId) {
        await supabaseAdmin
          .from("conversations")
          .update({ title: generatedNickname })
          .eq("id", conversationId);
        console.log(
          "[Supabase] Updated conversation title:",
          generatedNickname
        );
      }
    } else if (
      finalUserMessageContent.length > 0 &&
      imageUrlsForOpenAI.length > 0
    ) {
      // 1. First call: get image description
      console.log(
        "[OpenAI] generateImageDescription prompt:",
        JSON.stringify(finalUserMessageContent, null, 2)
      );
      const imageDescription = await generateImageDescription(
        finalUserMessageContent
      );
      console.log(
        "[OpenAI] generateImageDescription response:",
        imageDescription
      );
      generatedNickname = null;
      generatedImageDescription = imageDescription;
      // 2. Second call: generate nickname using user message and image description
      generatedNickname = await generateNicknameWithImageDescription(
        newMessageText,
        imageDescription
      );
      console.log("[OpenAI] generatedNickname:", generatedNickname);
    }
    if (savedMessage && generatedImageDescription) {
      await updateMessageWithImageDescription(
        supabaseAdmin,
        savedMessage.id,
        generatedImageDescription
      );
      savedMessage.image_description = generatedImageDescription;
      console.log(
        "[Supabase] Updated message with image description:",
        generatedImageDescription
      );
    }

    // --- Use the extracted stage instead of inferring it ---
    const stage = extractedStage;

    // --- Refactored prompt construction to use structured messages ---
    // Stringify history for userPrompt
    const historyString = (history || [])
      .map((msg: any) => {
        return msg.imageDescription
          ? `${msg.content}\n[Image Description: ${msg.imageDescription}]`
          : msg.content;
      })
      .join("\n---\n");

    // Prepare imageDescriptions as string[] if present
    const imageDescriptionsArr = generatedImageDescription
      ? [generatedImageDescription]
      : undefined;

    // Derivar intent
    const intent: IntentMode = isDraft ? "RefineDraft" : "NewSuggestions";

    // Build the full prompt string
    const fullPrompt = buildFullPrompt({
      intent,
      stage,
      userPreferences,
      chatHistory: historyString,
      latestMessage: newMessageText,
      imageDescriptions: imageDescriptionsArr,
      preferredCountry,
      simpPreference,
    });

    // OpenAI expects an array of message objects, not a single string
    const messages: ChatCompletionMessageParam[] = [
      { role: "user", content: fullPrompt },
    ];
    console.log(
      "[Analyze] Final OpenAI prompt for main AI response:",
      messages
    );

    // --- Stream OpenAI response to client ---
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let aiResponseBuffer = "";
    let sentTitle = false;
    try {
      await openaiClient.streamChatCompletion(messages, (text) => {
        aiResponseBuffer += text;
        // If we have a generated nickname and haven't sent it yet, include it in the SSE
        if (!sentTitle && generatedNickname && isInitialUserMessage) {
          res.write(
            `data: ${JSON.stringify({
              text,
              done: false,
              conversationTitle: generatedNickname,
            })}\n\n`
          );
          sentTitle = true;
        } else {
          res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
        }
      });
      res.write(
        `data: ${JSON.stringify({
          text: "",
          done: true,
          conversationTitle: generatedNickname || undefined,
        })}\n\n`
      );
      console.log(
        "[OpenAI] streamChatCompletion full response:",
        aiResponseBuffer
      );

      // --- Critique Agent: revisar y corregir la respuesta antes de guardar/enviar ---
      const promptInput = {
        intent,
        stage,
        userPreferences,
        chatHistory: historyString,
        latestMessage: newMessageText,
        imageDescriptions: imageDescriptionsArr,
        preferredCountry,
        simpPreference,
      };
      const { critique, finalReply } = await runCritiqueAgent(
        promptInput,
        aiResponseBuffer.trim(),
        openaiClient.getOpenAIClient()
      );
      console.log("[CritiqueAgent] Critique:", critique);

      // Save the final (critiqued) AI message to the database
      if (savedMessage && finalReply) {
        try {
          await supabaseAdmin.from("messages").insert({
            conversation_id: savedMessage.conversation_id,
            sender: "ai",
            content: finalReply,
          });
          console.log(
            "[Supabase] Saved AI message to DB (critiqued):",
            finalReply
          );
        } catch (saveErr) {
          // Log but do not interrupt the client
          console.error("Failed to save AI message:", saveErr);
        }
      }
      // Enviar la respuesta final al frontend
      res.end();
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({
          text: "Error streaming response",
          done: true,
        })}\n\n`
      );
      res.end();
      console.error("[OpenAI] streamChatCompletion error:", err);
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to analyze message", details: error.message });
    console.error("[Analyze] Fatal error:", error);
  }
}

export {
  parseAnalyzeRequest,
  generateNickname,
  saveMessageStub,
  uploadFilesToStorage,
  saveImageRecords,
  updateMessageWithImageDescription,
  generateImageDescriptionAndNickname,
  generateImageDescription,
  generateSuggestions,
};
