-- Table to store references to images associated with chat messages
CREATE TABLE IF NOT EXISTS public."ChatMessageImages" (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    message_id uuid NOT NULL,
    storage_path text NOT NULL, -- Path within the Supabase bucket (e.g., public/user_id/message_id/file.jpg)
    filename text NULL,
    content_type text NULL,
    filesize integer NULL, -- Size in bytes
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign key constraint linking to the messages table
    CONSTRAINT fk_message
      FOREIGN KEY(message_id)
      REFERENCES public.messages(id) -- Adjusted table(messages) and column(id) name
      ON DELETE CASCADE -- Optional: Delete image records if the message is deleted
);

-- Optional: Index for faster lookups by message_id
CREATE INDEX IF NOT EXISTS idx_chatmessageimages_message_id ON public."ChatMessageImages"(message_id);

-- Enable Row Level Security (Important for Supabase)
ALTER TABLE public."ChatMessageImages" ENABLE ROW LEVEL SECURITY;

-- Policies (Example: Allow authenticated users to read images linked to messages they can read)
-- You'll need to adapt these based on your actual 'messages' and access rules.
-- This is a basic example and might need refinement based on your specific auth logic.

-- Allow logged-in users to view images associated with messages they have access to
-- (Assuming your messages RLS allows users to read their messages)
-- You might need to adjust the EXISTS subquery condition based on your exact messages/conversations RLS
CREATE POLICY "Allow authenticated read access"
ON public."ChatMessageImages"
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM public.messages msg
    WHERE msg.id = public."ChatMessageImages".message_id
    -- Add your existing RLS condition from messages here, e.g.,
    -- AND msg.conversation_id IN (SELECT c.id FROM public.conversations c WHERE c.user_id = auth.uid())
    -- Without knowing the exact RLS on `messages`, this is a placeholder.
    -- If `messages` allows authenticated read, this might be sufficient, but review security.
  )
);


-- Allow backend service role (or specific authenticated users) to insert
-- Using 'service_role' bypasses RLS, which is needed for backend inserts.
CREATE POLICY "Allow service_role insert access"
ON public."ChatMessageImages"
FOR INSERT
WITH CHECK (auth.role() = 'service_role'); -- Allows only backend inserts

-- Grant usage on schema and select/insert/update/delete on table to relevant roles
-- Granting to service_role allows backend operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public."ChatMessageImages" TO service_role;
-- Granting SELECT to authenticated allows frontend access via RLS
GRANT SELECT ON TABLE public."ChatMessageImages" TO authenticated;


-- Ensure Supabase Storage bucket 'chat_images' exists and is public.
-- You can create this via the Supabase dashboard -> Storage -> Create bucket.
-- Set it as a Public bucket. Or use the CLI: supabase storage buckets create chat_images --public
-- NOTE: Bucket creation is not included in this migration SQL. 