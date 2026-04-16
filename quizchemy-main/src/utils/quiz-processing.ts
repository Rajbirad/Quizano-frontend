/**
 * Utility functions for tracking and managing previously processed quiz inputs
 * to enable regeneration options and avoid duplicate processing.
 */

interface ProcessingParams {
  [key: string]: any;
}

/**
 * Creates a unique signature for a quiz input based on content and parameters
 * @param content - The main content (text, file, URL, etc.)
 * @param params - Quiz generation parameters (questionCount, difficulty, etc.)
 * @param storageKey - Unique identifier for this type of processing
 * @returns A signature string for tracking
 */
export function createQuizSignature(
  content: string | File,
  params: ProcessingParams,
  storageKey: string
): string {
  if (typeof content === 'string') {
    // For text/URL content
    const normalizedContent = content.trim().replace(/\s+/g, ' ');
    return `${storageKey}_${normalizedContent.length}_${JSON.stringify(params)}_${normalizedContent.slice(0, 50)}`;
  } else {
    // For File objects
    return `${storageKey}_${content.name}_${content.size}_${content.lastModified}_${JSON.stringify(params)}`;
  }
}

/**
 * Checks if content with the same parameters was previously processed
 * @param content - The content to check
 * @param params - Current processing parameters
 * @param storageKey - The localStorage key for this processing type
 * @returns true if previously processed, false otherwise
 */
export function checkIfPreviouslyProcessed(
  content: string | File,
  params: ProcessingParams,
  storageKey: string
): boolean {
  const signature = createQuizSignature(content, params, storageKey);
  const processedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
  return processedItems.includes(signature);
}

/**
 * Marks content as processed in localStorage
 * @param content - The content that was processed
 * @param params - Processing parameters used
 * @param storageKey - The localStorage key for this processing type
 */
export function markAsProcessed(
  content: string | File,
  params: ProcessingParams,
  storageKey: string
): void {
  const signature = createQuizSignature(content, params, storageKey);
  const processedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (!processedItems.includes(signature)) {
    processedItems.push(signature);
    localStorage.setItem(storageKey, JSON.stringify(processedItems));
  }
}

/**
 * Storage keys for different quiz generation types
 */
export const STORAGE_KEYS = {
  YOUTUBE: 'processedQuizYouTubeUrls',
  UPLOAD: 'processedQuizFiles',
  VIDEO: 'processedQuizVideos',
  TEXT: 'processedQuizTexts',
  IMAGE: 'processedQuizImages',
  ANKI: 'processedQuizAnkiFiles',
  SIMILAR: 'processedSimilarQuestions'
} as const;
