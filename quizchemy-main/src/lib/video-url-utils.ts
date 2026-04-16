/**
 * Video URL utilities for handling different video sources
 * This is how real applications handle video serving - using direct cloud storage URLs
 */

import BlobUrlManager from './blob-url-manager';

export interface VideoSource {
  videoId?: string;
  s3Key?: string;
  bucketName?: string;
  type?: 'file' | 'youtube' | 'drive';
  url?: string;
}

/**
 * Constructs a direct S3 URL for video access
 * This is the most common approach in real applications
 */
export function constructS3VideoUrl(s3Key: string, bucketName?: string): string {
  // Get bucket from environment or use default
  const bucket = bucketName || import.meta.env.VITE_S3_BUCKET || 'quizchemy-videos';
  const region = import.meta.env.VITE_S3_REGION || 'us-east-1';
  
  // Construct direct S3 URL
  // Real apps use this format: https://{bucket}.s3.{region}.amazonaws.com/{key}
  // or CloudFront CDN: https://{cloudfront-domain}/{key}
  
  // If you have a CloudFront distribution (recommended for production)
  const cloudFrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${s3Key}`;
  }
  
  // Otherwise use direct S3 URL
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

/**
 * Gets the best available video URL from various sources
 * Priority order (how real apps handle this):
 * 1. Direct S3 URL (most reliable, no backend dependency)
 * 2. YouTube embed URL
 * 3. Blob URL (temporary, for immediate preview)
 */
export function getBestVideoUrl(sources: VideoSource): string | null {
  // 1. If we have S3 key, construct direct S3 URL (most common in real apps)
  if (sources.s3Key) {
    console.log('Using direct S3 URL for video:', sources.s3Key);
    return constructS3VideoUrl(sources.s3Key, sources.bucketName);
  }

  // 2. Handle YouTube videos
  if (sources.type === 'youtube' && sources.url) {
    if (sources.url.includes('/embed/')) {
      return sources.url; // Already an embed URL
    }
    
    // Convert YouTube watch URL to embed URL
    const videoId = sources.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]{11})/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // 3. Use provided URL (could be blob URL for immediate preview)
  if (sources.url) {
    console.log('Using provided URL:', sources.url);
    return sources.url;
  }

  return null;
}

/**
 * Checks if a video URL is available and accessible
 * Real apps often implement this to gracefully handle broken URLs
 */
export async function checkVideoAvailability(url: string): Promise<boolean> {
  try {
    if (url.startsWith('blob:')) {
      return true; // Blob URLs are typically valid if they exist
    }

    if (url.includes('youtube.com')) {
      return true; // YouTube URLs are generally reliable
    }

    // For S3 URLs, we could do a HEAD request, but that might be rate-limited
    // In real apps, you might implement this based on your specific needs
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Video availability check failed:', error);
    return false;
  }
}

/**
 * Revokes blob URLs to prevent memory leaks
 * Important for single-page applications
 */
export function cleanupBlobUrl(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    BlobUrlManager.revokeBlobUrl(url);
  }
}

/**
 * Creates a fallback chain for video URLs
 * Real apps implement this for better reliability
 */
export function createVideoFallbackChain(sources: VideoSource): string[] {
  const urls: string[] = [];

  // Primary: S3 direct URL
  if (sources.s3Key) {
    urls.push(constructS3VideoUrl(sources.s3Key, sources.bucketName));
  }

  // Secondary: Original URL (if not S3)
  if (sources.url && !sources.url.includes('s3.amazonaws.com')) {
    urls.push(sources.url);
  }

  return urls;
}