
export type CardType = 'fact' | 'concept' | 'definition' | 'problem';

// Helper function to determine card type based on content
export const determineCardType = (question: string, answer: string): CardType => {
  // Since we don't have tags, infer from content
  const text = (question + ' ' + answer).toLowerCase();
  if (text.includes('define') || text.includes('what is') || text.includes('meaning')) return 'definition';
  if (text.includes('explain') || text.includes('describe') || text.includes('concept')) return 'concept';
  if (text.includes('solve') || text.includes('calculate') || text.includes('find')) return 'problem';
  
  // Default to fact
  return 'fact';
};
