import {
  buildOptimisticUserMessage,
  serializeMessageHistory,
  extractImageUrlsFromFiles,
} from "../messageUtils";
import type { Message } from "../messageUtils";

describe("messageUtils", () => {
  describe("buildOptimisticUserMessage", () => {
    it("should build optimistic user message from FormData", () => {
      const formData = new FormData();
      formData.append("newMessageText", "Hello world");
      const imageUrls = ["url1", "url2"];

      const result = buildOptimisticUserMessage(formData, imageUrls);

      expect(result.sender).toBe("user");
      expect(result.content).toBe("Hello world");
      expect(result.imageUrls).toEqual(imageUrls);
      expect(result.optimistic).toBe(true);
      expect(result.id).toMatch(/^user-\d+$/);
    });
  });

  describe("serializeMessageHistory", () => {
    it("should serialize messages to JSON", () => {
      const messages: Message[] = [
        { id: "1", sender: "user", content: "Hello" },
        {
          id: "2",
          sender: "assistant",
          content: "Hi there",
          image_description: "A nice image",
        },
      ];
      const json = serializeMessageHistory(messages);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({ role: "user", content: "Hello" });
      expect(parsed[1]).toEqual({
        role: "assistant",
        content: "Hi there\n[Image Description: A nice image]",
      });
    });
  });

  describe("extractImageUrlsFromFiles", () => {
    beforeEach(() => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should extract URLs from files in FormData", () => {
      const formData = new FormData();
      const file1 = new File(["content1"], "image1.jpg", {
        type: "image/jpeg",
      });
      const file2 = new File(["content2"], "image2.png", { type: "image/png" });

      formData.append("images", file1);
      formData.append("images", file2);

      const result = extractImageUrlsFromFiles(formData);

      expect(result).toHaveLength(2);
      expect(result).toEqual(["blob:mock-url", "blob:mock-url"]);
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });

    it("should handle empty FormData", () => {
      const formData = new FormData();
      const result = extractImageUrlsFromFiles(formData);

      expect(result).toHaveLength(0);
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
