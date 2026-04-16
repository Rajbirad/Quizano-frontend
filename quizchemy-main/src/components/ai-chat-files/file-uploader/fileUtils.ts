
import { 
  File, 
  FileText, 
  FileImage, 
  FileType,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

/**
 * Returns the appropriate icon component for a given file name based on its extension
 */
export const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['pdf'].includes(extension || '')) return FileType;
  if (['doc', 'docx'].includes(extension || '')) return FileText;
  if (['ppt', 'pptx'].includes(extension || '')) return FileText;
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return FileImage;
  if (['csv', 'xls', 'xlsx'].includes(extension || '')) return FileSpreadsheet;
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(extension || '')) return FileCode;
  
  return File;
};

/**
 * Returns the appropriate color for a file icon based on its extension
 */
export const getFileIconColor = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['pdf'].includes(extension || '')) return 'text-red-500';
  if (['doc', 'docx'].includes(extension || '')) return 'text-blue-500';
  if (['ppt', 'pptx'].includes(extension || '')) return 'text-orange-500';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'text-purple-500';
  if (['csv', 'xls', 'xlsx'].includes(extension || '')) return 'text-green-500';
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(extension || '')) return 'text-yellow-500';
  
  return '';
};

/**
 * Formats file size to a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Validates file size (no size limit)
 */
export const validateFileSize = (file: File): boolean => {
  return true;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file type is supported
 */
export const isSupportedFileType = (fileName: string): boolean => {
  const supportedExtensions = [
    'txt', 'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'css', 'html', 
    'xml', 'csv', 'yml', 'yaml', 'log', 'pdf', 'doc', 'docx', 
    'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'
  ];
  
  const extension = getFileExtension(fileName);
  return supportedExtensions.includes(extension);
};
