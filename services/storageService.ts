// services/storageService.ts
// Appwrite 文件存储服务 - 支持音频和图片上传

import { Client, Storage, ID, InputFile } from 'react-native-appwrite';
import { client } from './appwrite';

// Storage buckets configuration
export const STORAGE_CONFIG = {
  AUDIO_BUCKET_ID: 'audio-files',
  IMAGES_BUCKET_ID: 'images', 
  ENDPOINT: 'https://api.freedomai.fun/v1',
  PROJECT_ID: '689c404400138a4a5f2d'
};

// Initialize storage client
export const storage = new Storage(client);

// Upload progress callback type
export type UploadProgressCallback = (progress: {
  $id: string;
  progress: number;
  sizeUploaded: number;
  chunksTotal: number;
  chunksUploaded: number;
}) => void;

// File upload result type
export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

/**
 * 上传音频文件到 Appwrite Storage
 */
export const uploadAudioFile = async (
  localUri: string,
  filename?: string,
  onProgress?: UploadProgressCallback
): Promise<FileUploadResult> => {
  try {
    console.log('🎵 Uploading audio file:', localUri);
    
    // Generate filename if not provided
    const audioFilename = filename || `audio_${Date.now()}.m4a`;
    
    // Create input file from local URI
    const inputFile = InputFile.fromPath(localUri, audioFilename, 'audio/m4a');
    
    // Upload file to audio bucket
    const file = await storage.createFile(
      STORAGE_CONFIG.AUDIO_BUCKET_ID,
      ID.unique(),
      inputFile,
      undefined,
      onProgress
    );
    
    // Generate public URL
    const url = `${STORAGE_CONFIG.ENDPOINT}/storage/buckets/${STORAGE_CONFIG.AUDIO_BUCKET_ID}/files/${file.$id}/view?project=${STORAGE_CONFIG.PROJECT_ID}`;
    
    console.log('✅ Audio uploaded successfully:', {
      fileId: file.$id,
      url: url,
      size: file.sizeOriginal
    });
    
    return {
      success: true,
      fileId: file.$id,
      url: url
    };
    
  } catch (error) {
    console.error('❌ Audio upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * 上传图片文件到 Appwrite Storage
 */
export const uploadImageFile = async (
  localUri: string,
  filename?: string,
  onProgress?: UploadProgressCallback
): Promise<FileUploadResult> => {
  try {
    console.log('🖼️ Uploading image file:', localUri);
    
    // Generate filename if not provided
    const imageFilename = filename || `image_${Date.now()}.jpg`;
    
    // Create input file from local URI
    const inputFile = InputFile.fromPath(localUri, imageFilename, 'image/jpeg');
    
    // Upload file to images bucket
    const file = await storage.createFile(
      STORAGE_CONFIG.IMAGES_BUCKET_ID,
      ID.unique(),
      inputFile,
      undefined,
      onProgress
    );
    
    // Generate public URL
    const url = `${STORAGE_CONFIG.ENDPOINT}/storage/buckets/${STORAGE_CONFIG.IMAGES_BUCKET_ID}/files/${file.$id}/view?project=${STORAGE_CONFIG.PROJECT_ID}`;
    
    console.log('✅ Image uploaded successfully:', {
      fileId: file.$id,
      url: url,
      size: file.sizeOriginal
    });
    
    return {
      success: true,
      fileId: file.$id,
      url: url
    };
    
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * 删除存储文件
 */
export const deleteStorageFile = async (
  bucketId: string,
  fileId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await storage.deleteFile(bucketId, fileId);
    console.log('✅ File deleted successfully:', fileId);
    return { success: true };
  } catch (error) {
    console.error('❌ File deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed'
    };
  }
};

/**
 * 获取文件信息
 */
export const getFileInfo = async (
  bucketId: string,
  fileId: string
) => {
  try {
    const file = await storage.getFile(bucketId, fileId);
    return file;
  } catch (error) {
    console.error('❌ Get file info failed:', error);
    return null;
  }
};

// ===== BUCKET MANAGEMENT =====

/**
 * Create storage buckets (admin operation)
 * Note: This should be done via Appwrite Console or backend API
 */
export const createStorageBuckets = (): void => {
  console.log('📁 Storage buckets configuration:');
  console.log(`- Audio Bucket ID: ${STORAGE_CONFIG.AUDIO_BUCKET_ID}`);
  console.log(`- Images Bucket ID: ${STORAGE_CONFIG.IMAGES_BUCKET_ID}`);
  console.log('- Create these buckets via Appwrite Console');
  console.log('- Set appropriate permissions for authenticated users');
  console.log('- Configure CORS if accessing from web');
};

/**
 * Get bucket information
 */
export const getBucketInfo = async (bucketId: string): Promise<ApiResponse<any>> => {
  try {
    const bucket = await storage.listFiles(bucketId);
    return {
      success: true,
      data: {
        bucketId,
        totalFiles: bucket.total,
        files: bucket.documents.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.LOAD_FAILED,
    };
  }
};

// ===== UTILITY EXPORTS =====

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<ApiResponse<{
  audioFiles: number;
  imageFiles: number;
  totalSize: number;
}>> => {
  try {
    const [audioResult, imageResult] = await Promise.allSettled([
      getBucketInfo(STORAGE_CONFIG.AUDIO_BUCKET_ID),
      getBucketInfo(STORAGE_CONFIG.IMAGES_BUCKET_ID),
    ]);
    
    const audioFiles = audioResult.status === 'fulfilled' && audioResult.value.success 
      ? audioResult.value.data.files : 0;
    const imageFiles = imageResult.status === 'fulfilled' && imageResult.value.success 
      ? imageResult.value.data.files : 0;
    
    return {
      success: true,
      data: {
        audioFiles,
        imageFiles,
        totalSize: 0, // Would need additional API calls to calculate
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.LOAD_FAILED,
    };
  }
};

// Export configuration as default
export default STORAGE_CONFIG;