import { reconcileMessages } from "./useMessages";
import type { Message } from "../utils/messageUtils";

describe("reconcileMessages", () => {
  it("should remove optimistic messages that have matching server messages", () => {
    const serverMessages: Message[] = [
      {
        id: "1",
        sender: "user",
        content: "Hello",
        imageUrls: ["url1", "url2"],
      },
      { id: "2", sender: "assistant", content: "Hi there", imageUrls: [] },
    ];
    const optimisticMessages: Message[] = [
      {
        id: "opt-1",
        sender: "user",
        content: "Hello",
        imageUrls: ["url1"],
        optimistic: true,
      },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.id === "opt-1")).toBeUndefined();
  });

  it("should keep optimistic messages that have no matching server messages", () => {
    const serverMessages: Message[] = [
      { id: "1", sender: "user", content: "Hello", imageUrls: [] },
    ];
    const optimisticMessages: Message[] = [
      {
        id: "opt-1",
        sender: "user",
        content: "Different message",
        imageUrls: [],
        optimistic: true,
      },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.id === "opt-1")).toBeDefined();
  });

  it("should filter out server messages that are less complete than optimistic ones", () => {
    const serverMessages: Message[] = [
      { id: "1", sender: "user", content: "Hello", imageUrls: ["url1"] },
    ];
    const optimisticMessages: Message[] = [
      {
        id: "opt-1",
        sender: "user",
        content: "Hello",
        imageUrls: ["url1", "url2"],
        optimistic: true,
      },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("opt-1");
  });

  it("should keep optimistic messages when server messages have equal or more images", () => {
    const serverMessages: Message[] = [
      {
        id: "1",
        sender: "user",
        content: "Hello",
        imageUrls: ["url1", "url2"],
      },
    ];
    const optimisticMessages: Message[] = [
      {
        id: "opt-1",
        sender: "user",
        content: "Hello",
        imageUrls: ["url1"],
        optimistic: true,
      },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
