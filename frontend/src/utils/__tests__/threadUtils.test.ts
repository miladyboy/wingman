import { filterThreadsByName, type Thread } from "../threadUtils";

describe("filterThreadsByName", () => {
  const threads: Thread[] = [
    { id: "1", name: "First chat" },
    { id: "2", name: "Another conversation" },
    { id: "3" }, // Thread without name
  ];

  it("should return all threads when query is empty or whitespace", () => {
    expect(filterThreadsByName(threads, "")).toEqual(threads);
    expect(filterThreadsByName(threads, "   ")).toEqual(threads);
  });

  it("should filter threads by name (case insensitive)", () => {
    expect(filterThreadsByName(threads, "chat")).toEqual([
      { id: "1", name: "First chat" },
    ]);
    expect(filterThreadsByName(threads, "CHAT")).toEqual([
      { id: "1", name: "First chat" },
    ]);
    expect(filterThreadsByName(threads, "first")).toEqual([
      { id: "1", name: "First chat" },
    ]);
    expect(filterThreadsByName(threads, "another")).toEqual([
      { id: "2", name: "Another conversation" },
    ]);
  });

  it("should return empty array when no matches found", () => {
    expect(filterThreadsByName(threads, "nope")).toEqual([]);
  });

  it("should handle null/undefined inputs gracefully", () => {
    expect(filterThreadsByName(null, "test")).toBe(null);
    expect(filterThreadsByName(threads, null)).toBe(threads);
    expect(filterThreadsByName(threads, undefined)).toBe(threads);
  });

  it("should handle threads without names", () => {
    expect(
      filterThreadsByName([{ id: "1" }, { id: "2", name: "Test" }], "test")
    ).toEqual([{ id: "2", name: "Test" }]);
  });
});
