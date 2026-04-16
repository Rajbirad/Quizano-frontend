
import { Flashcard, Deck } from '@/lib/types';

export function generateSubjectFlashcard(
  inputText: string, 
  deckId: string, 
  selectedDeck: Deck | undefined,
  mediaType: 'none' | 'image' | 'video' | 'youtube',
  mediaUrl: string
): {
  generatedQuestion: string;
  generatedAnswer: string;
  generatedHint: string;
  previewCard: Flashcard;
} {
  // Get the subject name
  const subjectName = selectedDeck?.name || 'General';
  
  // Generate flashcards based on the selected subject
  let generatedQuestion = '';
  let generatedAnswer = '';
  let generatedHint = '';
  
  // Subject-specific generation logic
  switch(deckId) {
    case 'math':
      generatedQuestion = inputText.includes('?') 
        ? inputText 
        : `Calculate the following: ${inputText}`;
      generatedAnswer = `[Math ${subjectName} answer]: The solution involves applying mathematical principles to get the result.`;
      generatedHint = "Try using algebraic principles or geometric formulas";
      break;
      
    case 'physics':
      generatedQuestion = inputText.includes('?') 
        ? inputText 
        : `Explain the physics concept: ${inputText}`;
      generatedAnswer = `[Physics ${subjectName} answer]: This involves understanding physical laws and principles.`;
      generatedHint = "Consider the fundamental laws of physics";
      break;
      
    case 'science':
      generatedQuestion = inputText.includes('?') 
        ? inputText 
        : `Define the science term: ${inputText}`;
      generatedAnswer = `[Science ${subjectName} answer]: This scientific concept is fundamental to understanding natural phenomena.`;
      generatedHint = "Think about scientific principles and terminology";
      break;
      
    default:
      generatedQuestion = inputText.includes('?') 
        ? inputText 
        : `What is "${inputText.substring(0, 40)}${inputText.length > 40 ? '...' : ''}"?`;
      generatedAnswer = `[General knowledge]: ${inputText.substring(0, 100)}...`;
      generatedHint = "Generated hint: Try to recall key concepts";
  }
  
  // Create preview with subject-specific content
  const media = mediaType !== 'none' ? {
    type: mediaType as 'image' | 'video' | 'youtube',
    url: mediaUrl
  } : undefined;
  
  const previewCard: Flashcard = {
    id: 'preview',
    question: generatedQuestion,
    answer: generatedAnswer,
    hint: generatedHint,
    deckId: deckId,
    deckName: subjectName,
    createdAt: new Date(),
    lastReviewed: null,
    nextReview: new Date(),
    difficulty: 0.3,
    media
  };

  return {
    generatedQuestion,
    generatedAnswer,
    generatedHint,
    previewCard
  };
}
