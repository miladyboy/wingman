import { createConversation, sendMessageToBackend } from "../messageService";
import type { SupabaseClient } from "@supabase/supabase-js";

// Create a proper mock for SupabaseClient
const createMockSupabaseClient = (mockImplementation: any): SupabaseClient => {
  return {
    ...mockImplementation,
    // Add minimal required properties for SupabaseClient
    supabaseUrl: "http://localhost:3000",
    supabaseKey: "test-key",
    auth: {},
    realtime: {},
    storage: {},
    functions: {},
    channel: jest.fn(),
    getChannels: jest.fn(),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
    rest: {},
    postgrest: {},
    schema: jest.fn(),
    rpc: jest.fn(),
  } as unknown as SupabaseClient;
};

describe("messageService", () => {
  describe("createConversation", () => {
    it("should create a conversation successfully", async () => {
      const mockSupabase = createMockSupabaseClient({
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "123",
                  user_id: "user1",
                  title: "Test",
                  created_at: "2023-01-01",
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await createConversation(mockSupabase, "user1", "Test");
      expect(result.id).toBe("123");
      expect(result.title).toBe("Test");
    });

    it("should throw error when supabase operation fails", async () => {
      const mockSupabase = createMockSupabaseClient({
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error("fail"),
              }),
            }),
          }),
        }),
      });

      await expect(
        createConversation(mockSupabase, "user1", "Test")
      ).rejects.toThrow("fail");
    });

    it("should throw error when no data is returned", async () => {
      const mockSupabase = createMockSupabaseClient({
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        createConversation(mockSupabase, "user1", "Test")
      ).rejects.toThrow("Failed to create conversation: No data returned.");
    });
  });

  describe("sendMessageToBackend", () => {
    it("should call fetch with correct params", async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      const formData = new FormData();
      await sendMessageToBackend("http://api", "token", formData, mockFetch);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api/analyze",
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer token" },
          body: formData,
        })
      );
    });
  });
});
