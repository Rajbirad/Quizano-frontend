/**
 * Blob URL Manager - Prevents memory leaks from multiple blob URLs
 * This is essential for React applications that handle file uploads
 */

class BlobUrlManager {
  private static activeBlobUrls = new Set<string>();

  /**
   * Creates a blob URL and tracks it for cleanup
   */
  static createBlobUrl(file: File): string {
    const blobUrl = URL.createObjectURL(file);
    this.activeBlobUrls.add(blobUrl);
    console.log('Created blob URL:', blobUrl, 'Total active:', this.activeBlobUrls.size);
    return blobUrl;
  }

  /**
   * Revokes a specific blob URL
   */
  static revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
        this.activeBlobUrls.delete(url);
        console.log('Revoked blob URL:', url, 'Remaining active:', this.activeBlobUrls.size);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', url, error);
      }
    }
  }

  /**
   * Cleans up all active blob URLs (useful for page unload)
   */
  static revokeAllBlobUrls(): void {
    console.log('Cleaning up all blob URLs:', this.activeBlobUrls.size);
    this.activeBlobUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke blob URL during cleanup:', url, error);
      }
    });
    this.activeBlobUrls.clear();
  }

  /**
   * Gets count of active blob URLs (for debugging)
   */
  static getActiveBlobCount(): number {
    return this.activeBlobUrls.size;
  }

  /**
   * Checks if a URL is an active blob URL
   */
  static isActiveBlobUrl(url: string): boolean {
    return this.activeBlobUrls.has(url);
  }
}

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    BlobUrlManager.revokeAllBlobUrls();
  });
}

export default BlobUrlManager;