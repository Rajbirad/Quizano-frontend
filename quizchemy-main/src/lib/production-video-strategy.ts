/**
 * Production-Ready Video URL Strategy
 * This mirrors how real apps like Netflix, YouTube work
 */

import BlobUrlManager from './blob-url-manager';

export interface VideoSourceConfig {
  videoId?: string;
  s3Key?: string;
  bucketName?: string;
  type?: 'file' | 'youtube' | 'drive';
  url?: string;
  uploadStatus?: 'uploading' | 'processing' | 'completed' | 'failed';
}

/**
 * Production video URL strategy - exactly how real apps work:
 * 
 * Phase 1: UPLOAD (Show blob URL for immediate preview)
 * Phase 2: PROCESSING (Still show blob URL while backend processes)
 * Phase 3: COMPLETED (Switch to S3/CDN URL, cleanup blob)
 */
export class ProductionVideoStrategy {
  
  /**
   * Gets video URL based on upload/processing state
   * This is exactly how production apps work
   */
  static getVideoUrl(config: VideoSourceConfig): {
    url: string | null;
    source: 's3' | 'youtube' | 'blob' | 'none';
    shouldCleanupBlob: boolean;
  } {
    
    // PRODUCTION PHASE 3: Video fully processed - use S3/CDN (like Netflix)
    if (config.uploadStatus === 'completed' && config.s3Key) {
      console.log('✅ PRODUCTION: Using S3 URL (upload completed)');
      return {
        url: this.constructS3Url(config.s3Key, config.bucketName),
        source: 's3',
        shouldCleanupBlob: true // Clean up blob URL now
      };
    }
    
    // YOUTUBE: Always use embed URL (like YouTube embed)
    if (config.type === 'youtube' && config.url) {
      console.log('✅ PRODUCTION: Using YouTube embed');
      return {
        url: this.getYouTubeEmbedUrl(config.url),
        source: 'youtube',
        shouldCleanupBlob: false
      };
    }
    
    // PRODUCTION PHASE 1 & 2: Uploading/Processing - show blob for preview
    if ((config.uploadStatus === 'uploading' || config.uploadStatus === 'processing') && config.url?.startsWith('blob:')) {
      console.log('🔄 PRODUCTION: Using blob URL during upload/processing');
      return {
        url: config.url,
        source: 'blob',
        shouldCleanupBlob: false // Keep blob during upload
      };
    }
    
    // FALLBACK: Try any available URL
    if (config.url) {
      const source = config.url.startsWith('blob:') ? 'blob' : 's3';
      console.log(`⚠️ FALLBACK: Using ${source} URL`);
      return {
        url: config.url,
        source: source as 'blob' | 's3',
        shouldCleanupBlob: false
      };
    }
    
    console.log('❌ No video URL available');
    return {
      url: null,
      source: 'none',
      shouldCleanupBlob: true
    };
  }
  
  /**
   * Constructs S3 URL - production method
   */
  private static constructS3Url(s3Key: string, bucketName?: string): string {
    const bucket = bucketName || import.meta.env.VITE_S3_BUCKET || 'quizchemy-videos';
    const region = import.meta.env.VITE_S3_REGION || 'us-east-1';
    
    // Check for CloudFront (production CDN)
    const cloudFrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${s3Key}`;
    }
    
    // Direct S3 URL
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
  }
  
  /**
   * Gets YouTube embed URL
   */
  private static getYouTubeEmbedUrl(url: string): string {
    if (url.includes('/embed/')) {
      return url;
    }
    
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]{11})/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  }
  
  /**
   * Transitions from blob URL to S3 URL when upload completes
   * This is how real apps switch from preview to final URL
   */
  static transitionToProduction(
    currentUrl: string | null, 
    s3Key: string, 
    bucketName?: string
  ): { newUrl: string; shouldCleanupOldUrl: boolean } {
    
    const productionUrl = this.constructS3Url(s3Key, bucketName);
    
    // If current URL is blob, we should clean it up
    const shouldCleanup = currentUrl?.startsWith('blob:') || false;
    
    console.log('🔄 PRODUCTION: Transitioning to S3 URL', {
      from: currentUrl,
      to: productionUrl,
      willCleanup: shouldCleanup
    });
    
    return {
      newUrl: productionUrl,
      shouldCleanupOldUrl: shouldCleanup
    };
  }
}

/**
 * Manages the blob-to-production URL lifecycle
 * Real apps implement this pattern for smooth user experience
 */
export class VideoUrlLifecycle {
  private currentUrl: string | null = null;
  private onUrlChange: (url: string | null) => void;
  
  constructor(onUrlChange: (url: string | null) => void) {
    this.onUrlChange = onUrlChange;
  }
  
  /**
   * Updates video URL based on upload state
   */
  updateVideoState(config: VideoSourceConfig): void {
    const result = ProductionVideoStrategy.getVideoUrl(config);
    
    // Clean up blob URL if we're switching to production URL
    if (result.shouldCleanupBlob && this.currentUrl?.startsWith('blob:')) {
      BlobUrlManager.revokeBlobUrl(this.currentUrl);
    }
    
    // Update URL if it changed
    if (result.url !== this.currentUrl) {
      this.currentUrl = result.url;
      this.onUrlChange(result.url);
    }
  }
  
  /**
   * Cleanup when component unmounts
   */
  cleanup(): void {
    if (this.currentUrl?.startsWith('blob:')) {
      BlobUrlManager.revokeBlobUrl(this.currentUrl);
    }
  }
}