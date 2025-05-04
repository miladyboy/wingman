-- Add last_message_at to conversations for chat reordering
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Optionally, backfill with the latest message timestamp per conversation
UPDATE public.conversations c
SET last_message_at = sub.max_created_at
FROM (
  SELECT conversation_id, MAX(created_at) AS max_created_at
  FROM public.messages
  GROUP BY conversation_id
) sub
WHERE c.id = sub.conversation_id; 