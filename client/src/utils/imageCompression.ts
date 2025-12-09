/**
 * Image compression utility using browser-image-compression
 * Reduces file size by 50-70% while maintaining good quality
 */

export interface CompressionOptions {
  maxSizeMB?: number; // Maximum file size in MB (default: 1MB)
  maxWidthOrHeight?: number; // Maximum width or height (default: 1920px)
  useWebWorker?: boolean; // Use web worker for better performance (default: true)
  fileType?: string; // Output file type (default: keep original)
  initialQuality?: number; // Initial quality (0-1, default: 0.8)
}

/**
 * Compress an image file
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Only compress image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    fileType = file.type,
    initialQuality = 0.8,
  } = options;

  try {
    // Dynamic import to avoid loading the library if not needed
    const imageCompression = (await import('browser-image-compression')).default;

    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType,
      initialQuality,
    });

    // Log compression result
    const originalSize = (file.size / 1024 / 1024).toFixed(2);
    const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(`Image compressed: ${originalSize}MB → ${compressedSize}MB (${reduction}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple image files
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files (non-image files are returned as-is)
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressedFiles = await Promise.all(
    files.map((file) => compressImage(file, options))
  );

  return compressedFiles;
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get recommended compression options based on file type
 */
export function getCompressionOptions(fileType: string): CompressionOptions {
  // For avatars, use smaller size
  if (fileType.includes('avatar')) {
    return {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      initialQuality: 0.85,
    };
  }

  // For transaction attachments, allow larger size
  if (fileType.includes('transaction')) {
    return {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      initialQuality: 0.8,
    };
  }

  // Default for messages and comments
  return {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    initialQuality: 0.8,
  };
}

