/**
 * Message interface for utility functions.
 */
export interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  imageUrls?: string[];
  image_description?: string;
  optimistic?: boolean;
  [key: string]: any;
}

/**
 * Optimistic user message for immediate UI feedback.
 */
export interface OptimisticUserMessage extends Message {
  optimistic: true;
  sender: "user";
}

/**
 * Serialized message for backend consumption.
 */
export interface SerializedMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Builds an optimistic user message object for immediate UI feedback.
 * @param {FormData} formData - The form data containing the message and images.
 * @param {string[]} imageUrls - Array of image preview URLs.
 * @returns {object} Optimistic user message object.
 */
export function buildOptimisticUserMessage(
  formData: FormData,
  imageUrls: string[]
): OptimisticUserMessage {
  return {
    id: `user-${Date.now()}`,
    sender: "user",
    content: (formData.get("newMessageText") as string) || "",
    imageUrls,
    optimistic: true,
  };
}

/**
 * Serializes the message history for backend consumption.
 * @param {Array} messages - Array of message objects.
 * @returns {string} JSON string of message history.
 */
export function serializeMessageHistory(messages: Message[]): string {
  return JSON.stringify(
    messages.map(
      (m): SerializedMessage => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.image_description
          ? `${m.content || ""}\n[Image Description: ${m.image_description}]`
          : m.content,
      })
    )
  );
}

/**
 * Extracts preview URLs from image files in a FormData object.
 * @param {FormData} formData - The form data containing images.
 * @returns {string[]} Array of preview URLs for images.
 */
export function extractImageUrlsFromFiles(formData: FormData): string[] {
  const urls: string[] = [];
  const images = formData.getAll("images");
  for (const file of images) {
    if (file instanceof File) {
      urls.push(URL.createObjectURL(file));
    }
  }
  return urls;
}
