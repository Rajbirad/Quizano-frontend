export interface FileValidationOptions {
  allowedExtensions: string[];
  maxSizeMB?: number;
  customMaxSizes?: Record<string, number>; // Extension-specific max sizes
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    extension: string;
    sizeMB: number;
  };
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  const fileSizeMB = file.size / (1024 * 1024);

  // Check file type
  if (!options.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${options.allowedExtensions.join(', ')}. Current: ${fileExtension}`,
      fileInfo: { extension: fileExtension, sizeMB: fileSizeMB }
    };
  }

  // Check file size
  let maxSize = options.maxSizeMB || 10;
  if (options.customMaxSizes && options.customMaxSizes[fileExtension]) {
    maxSize = options.customMaxSizes[fileExtension];
  }

  if (fileSizeMB > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${maxSize}MB. Current: ${fileSizeMB.toFixed(1)}MB`,
      fileInfo: { extension: fileExtension, sizeMB: fileSizeMB }
    };
  }

  return {
    isValid: true,
    fileInfo: { extension: fileExtension, sizeMB: fileSizeMB }
  };
}

export function createFileSignature(file: File, params: Record<string, any>): string {
  return `${file.name}_${file.size}_${file.lastModified}_${JSON.stringify(params)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes > 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}
