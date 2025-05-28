const request = require("supertest");

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: {
      text: "Likes cats",
      preferred_country: "en",
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
  // Deprecated auth utils no longer used
  getUserIdFromAuthHeader: jest.fn(() => Promise.resolve("test-user-id")),
}));

jest.mock("../../services/authService", () => ({
  verifyToken: jest.fn(() =>
    Promise.resolve({
      userId: "test-user-id",
      email: "test@example.com",
      roles: ["authenticated"],
    })
  ),
}));

jest.mock("../../services/supabaseService", () => ({
  supabaseAdmin: mockSupabase,
}));

jest.mock("../../services/openaiService", () => {
  return {
    OpenAIService: jest.fn().mockImplementation(() => mockOpenAIService),
  };
});

jest.mock("../../middleware/requireAuth", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.auth = {
      userId: "test-user-id",
      email: "test@example.com",
      roles: ["authenticated"],
    };
    return next();
  },
}));

let app: any;
beforeAll(() => {
  app = require("../../app").default;
});

describe("analyze endpoint integration", () => {
  it.skip("returns 401 if user is not authenticated", async () => {
    const { verifyToken } = require("../../services/authService");
    verifyToken.mockImplementationOnce(() => {
      throw new Error("invalid");
    });
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

  it("processes a valid prompt and injects user preferences into the prompt", async () => {
    const res = await request(app)
      .post("/analyze")
      .set("Authorization", "Bearer valid-token")
      .send({
        historyJson: "[]",
        newMessageText: "Hello!",
        conversationId: "conv-1",
        isDraft: false,
      });
    // Ensure the backend responded OK
    expect(res.status).toBe(200);

    // Verify that the OpenAIService was called with a prompt that contains the user preferences string
    const firstCallArgs = mockOpenAIService.streamChatCompletion.mock.calls[0];
    expect(firstCallArgs).toBeDefined();
    const messagesArg = firstCallArgs[0];
    expect(Array.isArray(messagesArg)).toBe(true);

    // The messages array structure is: [system, optional_few_shot, user]
    // User preferences should be in the user message (last element)
    const userMessage = messagesArg[messagesArg.length - 1];
    expect(userMessage.role).toBe("user");
    expect(userMessage.content).toEqual(expect.stringContaining("Likes cats"));
  });
});
