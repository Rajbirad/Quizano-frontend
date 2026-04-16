
// This file provides AI services for the application
// Currently using mock implementations that simulate AI functionality

/**
 * Processes text content to generate a bullet-point summary
 * @param content The note content to summarize
 * @returns A bullet-point summary of the content
 */
export const generateBulletSummary = async (content: string): Promise<string> => {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock implementation
  // In a real app, this would call an AI service API
  const lines = content.split('\n').filter(line => line.trim());
  
  let summary = '# AI-Generated Bullet Summary\n\n';
  
  // Extract the first few sentences or segments
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line) {
      // Generate emoji based on content
      const emojis = ['🔍', '💡', '✅', '📌', '🎯', '📊', '🌟'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      summary += `- ${emoji} ${line.substring(0, Math.min(100, line.length))}\n`;
    }
  }
  
  summary += '\n*This is an AI-generated summary of your note.*';
  return summary;
};

/**
 * Processes text content to generate a paragraph summary
 * @param content The note content to summarize
 * @returns A paragraph summary of the content
 */
export const generateParagraphSummary = async (content: string): Promise<string> => {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simple mock implementation
  // In a real app, this would call an AI service API
  const words = content.split(/\s+/).filter(word => word.trim());
  
  let summary = '# AI-Generated Paragraph Summary\n\n';
  
  if (words.length > 0) {
    // Create a topic sentence
    summary += `This note discusses ${words.slice(0, 5).join(' ')}... `;
    
    // Add middle content if there's enough
    if (words.length > 10) {
      summary += `The key concepts include ${words.slice(5, 15).join(' ')}... `;
    }
    
    // Add a conclusion
    summary += `In conclusion, this content relates to ${words.slice(-5).join(' ')}.`;
  } else {
    summary += 'This note does not contain enough content to generate a meaningful summary.';
  }
  
  summary += '\n\n*This is an AI-generated summary of your note.*';
  return summary;
};

/**
 * Processes text content to generate action items
 * @param content The note content to summarize
 * @returns A list of action items extracted from the content
 */
export const generateActionSummary = async (content: string): Promise<string> => {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simple mock implementation
  // In a real app, this would call an AI service API
  const lines = content.split('\n').filter(line => line.trim());
  
  let summary = '# AI-Generated Action Items\n\n';
  let actionItemCount = 0;
  
  // Look for phrases that might indicate tasks
  const actionPhrases = ['need to', 'should', 'must', 'remember', 'don\'t forget', 'important'];
  
  for (const line of lines) {
    for (const phrase of actionPhrases) {
      if (line.toLowerCase().includes(phrase) && actionItemCount < 5) {
        summary += `- [ ] ${line.trim()}\n`;
        actionItemCount++;
        break;
      }
    }
  }
  
  // If no action items were found, create some generic ones
  if (actionItemCount === 0) {
    summary += `- [ ] Follow up on key points from this note\n`;
    summary += `- [ ] Research more about topics mentioned\n`;
    summary += `- [ ] Share findings with relevant team members\n`;
  }
  
  summary += '\n*These are AI-generated action items based on your note.*';
  return summary;
};

/**
 * Analyzes text content and automatically generates tags
 * @param content The note content to analyze
 * @returns An array of suggested tags
 */
export const generateTags = async (content: string): Promise<string[]> => {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Simple mock implementation
  // In a real app, this would use NLP to identify key topics
  const commonTopics = [
    'work', 'meeting', 'project', 'idea', 'research',
    'personal', 'finance', 'health', 'education', 'technology',
    'science', 'art', 'writing', 'travel', 'food'
  ];
  
  const tags: string[] = [];
  
  // Check if content contains words related to common topics
  for (const topic of commonTopics) {
    if (content.toLowerCase().includes(topic)) {
      tags.push(topic);
    }
  }
  
  // Limit to 3 tags maximum
  return tags.slice(0, 3);
};
