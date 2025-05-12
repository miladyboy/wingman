import * as dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'chat-images';

console.log(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

async function main(): Promise<void> {
  const supabase: SupabaseClient = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string);

  // Check if the bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }
  if (buckets && buckets.some(bucket => bucket.name === BUCKET_NAME)) {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
    return;
  }

  // Create the bucket
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: false, // Change to true if you want the bucket to be public
  });

  if (error) {
    console.error('Error creating bucket:', error);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET_NAME}" created successfully!`);
}

main(); 