/**
 * ChatEmptyState displays a message when there are no chats or a new chat is being started.
 * Used in MainApp to provide a consistent empty state UI.
 */
export default function ChatEmptyState() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground pt-10"
      data-testid="chat-empty-state"
    >
      <h2
        className="text-3xl font-bold mb-4 text-foreground opacity-0 animate-fade-in"
        style={{ transition: "opacity 1s ease" }}
      >
        Your wingman is ready
      </h2>
      <div className="space-y-2 text-lg">
        <div>💬 Upload a screenshot or paste your convo.</div>
        <div>📸 Image, text, or both, whatever works best.</div>
        <div>
          🧠 Harem will read the vibe and give you smart replies instantly.
        </div>
        <div>
          🗣️ Or just ask for advice, we're here for your flirting dilemmas.
        </div>
      </div>
    </div>
  );
}
