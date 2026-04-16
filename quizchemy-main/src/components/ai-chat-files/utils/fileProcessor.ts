
export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['pdf'].includes(extension || '')) return 'PDF';
  if (['doc', 'docx'].includes(extension || '')) return 'Word';
  if (['ppt', 'pptx'].includes(extension || '')) return 'PowerPoint';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'image';
  if (['txt', 'log'].includes(extension || '')) return 'text';
  if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) return 'JavaScript/TypeScript';
  if (['json'].includes(extension || '')) return 'JSON';
  if (['html', 'xml'].includes(extension || '')) return 'markup';
  if (['css'].includes(extension || '')) return 'CSS';
  
  return 'document';
};
