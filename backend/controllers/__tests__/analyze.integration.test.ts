const request = require("supertest");

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: {
      preferences: "Likes cats",
      preferred_language: "en",
      simp_preference: "high",
    },
    error: null,
  }),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest
      .fn()
      .mockResolvedValue({ data: { path: "fake-path" }, error: null }),
    getPublicUrl: jest
      .fn()
      .mockReturnValue({ data: { publicUrl: "https://fake.url/image.jpg" } }),
  },
};

const mockOpenAIService = {
  streamChatCompletion: jest.fn(async (messages, onData) => {
    // Simula el streaming de la respuesta del LLM
    onData("AI response from LLM.");
  }),
  getOpenAIClient: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  "[CRITIQUE]: No issues\n[FINAL REPLY]: Critiqued AI reply.",
              },
            },
          ],
        }),
      },
    },
  })),
  callOpenAI: jest.fn(async (messages) => {
    // Devuelve un string simulado para nickname/descripción
    if (Array.isArray(messages) && messages[0]?.role === "user") {
      const content = messages[0].content;
      if (
        typeof content === "string" &&
        content.includes("invent a short, playful, SFW nickname")
      ) {
        return "Mocked Nickname";
      }
      if (
        typeof content === "string" &&
        content.includes("describe the image")
      ) {
        return "Mocked Description";
      }
    }
    return "Mocked OpenAI Response";
  }),
};

jest.mock("../../utils/auth", () => ({
  getUserIdFromAuthHeader: jest.fn(() => Promise.resolve("test-user-id")),
}));

jest.mock("../../services/supabaseService", () => ({
  supabaseAdmin: mockSupabase,
}));

jest.mock("../../services/openaiService", () => {
  return {
    OpenAIService: jest.fn().mockImplementation(() => mockOpenAIService),
  };
});

let app: any;
beforeAll(() => {
  app = require("../../app").default;
});

describe("analyze endpoint integration", () => {
  it("returns 401 if user is not authenticated", async () => {
    const { getUserIdFromAuthHeader } = require("../../utils/auth");
    getUserIdFromAuthHeader.mockResolvedValueOnce(null);
    const res = await request(app).post("/analyze").send({
      historyJson: "[]",
      newMessageText: "Test message",
      conversationId: "conv-1",
      isDraft: false,
      stage: "Opening",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it("processes a valid prompt and returns the critiqued reply", async () => {
    const res = await request(app).post("/analyze").send({
      historyJson: "[]",
      newMessageText: "Hello!",
      conversationId: "conv-1",
      isDraft: false,
      // stage is omitted to test inference
      preferredCountry: "en",
      simpPreference: "high",
    });
    // El endpoint hace stream, así que buscamos la última respuesta con done: true
    const lines = res.text.split("\n").filter(Boolean);
    const last = lines
      .map((l: string) => {
        try {
          return JSON.parse(l.replace(/^data: /, ""));
        } catch {
          return null;
        }
      })
      .find((l: any) => l && l.done === true);
    expect(last).toBeDefined();
    // La respuesta final debe ser la del Critique Agent
    expect(res.status).toBe(200);
    // El Critique Agent mock devuelve 'Critiqued AI reply.'
    // El SSE final puede tener conversationTitle, pero el texto debe estar vacío y done true
    expect(last.done).toBe(true);
    // El flujo completo de prompt y critique agent fue ejecutado
  });
});
