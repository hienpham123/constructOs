import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client (singleton)
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  // Return null if Supabase is not configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Supabase not configured - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  // Return existing client if already initialized
  if (supabaseClient) {
    return supabaseClient;
  }

  // Initialize new client
  try {
    // Log để verify (chỉ log một phần key để security)
    const keyPreview = process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...';
    console.log(`✅ Initializing Supabase client with URL: ${process.env.SUPABASE_URL}`);
    console.log(`✅ Using Service Role Key: ${keyPreview} (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`);
    
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    console.log('✅ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    return null;
  }
}

/**
 * Upload file to Supabase Storage
 * @param bucketName - Name of the bucket (e.g., 'avatars', 'transactions')
 * @param filePath - Local file path
 * @param fileName - Name to save in storage (e.g., 'uuid.jpg')
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  fileName: string
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const contentType = getContentType(fileExt);

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`Error uploading to Supabase Storage (${bucketName}):`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading file to Supabase Storage:`, error);
    return null;
  }
}

/**
 * Upload file buffer directly to Supabase Storage (without saving to disk first)
 * @param bucketName - Name of the bucket
 * @param fileBuffer - File buffer
 * @param fileName - Name to save in storage
 * @param contentType - MIME type
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadBufferToSupabaseStorage(
  bucketName: string,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    console.log(`⚠️  Supabase Storage not enabled - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`);
    return null;
  }

  try {
    console.log(`📤 Uploading to Supabase Storage: ${bucketName}/${fileName} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);
    
    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error uploading to Supabase Storage (${bucketName}):`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`✅ Uploaded to Supabase: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading buffer to Supabase Storage:`, error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 * @param bucketName - Name of the bucket
 * @param fileName - Name of file to delete
 * @returns true if successful, false otherwise
 */
export async function deleteFromSupabaseStorage(
  bucketName: string,
  fileName: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error(`Error deleting from Supabase Storage (${bucketName}):`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting file from Supabase Storage:`, error);
    return false;
  }
}

/**
 * Check if Supabase Storage is configured
 */
export function isSupabaseStorageEnabled(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Get public URL for a file in Supabase Storage
 * @param bucketName - Name of the bucket
 * @param fileName - Name of the file
 * @returns Public URL
 */
export function getSupabaseStorageUrl(bucketName: string, fileName: string): string {
  const client = getSupabaseClient();
  if (!client) {
    return '';
  }

  const { data } = client.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
  };

  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
}

