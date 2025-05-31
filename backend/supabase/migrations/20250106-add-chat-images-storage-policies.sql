-- Enable RLS on the storage.objects table for chat-images bucket
-- This allows users to read their own uploaded images

-- Policy: Allow users to read images in their own folder
CREATE POLICY "Users can read their own chat images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to insert images in their own folder (for completeness)
CREATE POLICY "Users can upload to their own chat images folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to update their own images (for completeness)
CREATE POLICY "Users can update their own chat images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to delete their own images (for completeness)
CREATE POLICY "Users can delete their own chat images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  ); 