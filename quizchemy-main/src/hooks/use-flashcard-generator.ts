
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/lib/types';
import { addFlashcard } from '@/lib/flashcard-store';
import { defaultDecks } from '@/lib/default-data';

interface UploadedFile {
  name: string;
  type: string;
  content: string;
  file: File; // Add the actual File object
}

export function useFlashcardGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [forceNewFlashcards, setForceNewFlashcards] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 35 * 1024 * 1024; // 35 MB

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errorMsg = `File size (${sizeMB}MB) exceeds maximum allowed size of 35MB.`;
      setFileValidationError(errorMsg);
      setUploadedFile(null);
      return;
    }
    
    // Clear any previous error
    setFileValidationError(null);
    
    setIsFileProcessing(true);
    
    // Mock file processing - in a real app, you would use libraries to extract text from PDFs, etc.
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const fileContent = event.target?.result as string || '';
      const fileType = file.type || 'unknown';
      
      setUploadedFile({
        name: file.name,
        type: fileType,
        content: fileContent.substring(0, 1000), // Just for demonstration
        file: file // Add the actual file object
      });
      
      setIsFileProcessing(false);
    };
    
    
    reader.onerror = () => {
      setIsFileProcessing(false);
      toast({
        title: "Error reading file",
        description: "There was a problem reading the uploaded file.",
        variant: "destructive",
      });
    };
    
    if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const generateCardsFromFile = (file: UploadedFile, deckId: string, deckName: string): Flashcard[] => {
    // In a real application, you would use AI to analyze the file content
    // This is a simplified mock version that creates sample cards
    
    const fileType = file.type.includes('pdf') ? 'PDF' : 
                    (file.type.includes('word') ? 'Word document' : 
                    (file.type.includes('image') ? 'image' : 'document'));
    
    return [
      {
        id: `file-${Date.now()}-1`,
        question: `<p>What is the main topic of this ${fileType}?</p>`,
        answer: `<p>The main topic appears to be about ${file.name.split('.')[0]}.</p>`,
        deckId: deckId,
        deckName: deckName,
        title: `${file.name} - Topic`,
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: 0.5
      },
      {
        id: `file-${Date.now()}-2`,
        question: `<p>What are the key points from this ${fileType}?</p>`,
        answer: `<p>The key points from ${file.name} include:</p><ul><li>First key concept</li><li>Second important idea</li><li>Third critical insight</li></ul>`,
        deckId: deckId,
        deckName: deckName,
        title: `${file.name} - Key Points`,
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: 0.5
      },
      {
        id: `file-${Date.now()}-3`,
        question: `<p>Summarize the content of this ${fileType}.</p>`,
        answer: `<p>This ${fileType} covers information about ${file.name.split('.')[0]}. It appears to discuss several important concepts and provides detailed explanations of the subject matter.</p>`,
        deckId: deckId,
        deckName: deckName,
        title: `${file.name} - Summary`,
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: 0.5
      }
    ];
  };

  const generateFlashcards = (inputText: string, selectedDeck: string, mediaType: string, mediaUrl: string) => {
    // Check if there's content to generate from
    if (!inputText.trim() && mediaType === 'none' && !uploadedFile) {
      toast({
        title: "Empty content",
        description: "Please enter some text, upload an image/video, file, or add a YouTube link to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Mock AI generation
    setTimeout(() => {
      const deckName = defaultDecks.find(deck => deck.id === selectedDeck)?.name || 'General';
      
      // Generate different sample cards based on the input type
      let newCards: Flashcard[] = [];
      
      if (uploadedFile) {
        // Generate cards from the uploaded file
        const fileBasedCards = generateCardsFromFile(uploadedFile, selectedDeck, deckName);
        newCards = fileBasedCards;
      } else if (inputText.trim()) {
        // Generate cards from text input
        newCards = [
          {
            id: `card-${Date.now()}-1`,
            question: `<p>What is the main concept of ${inputText.substring(0, 30)}...?</p>`,
            answer: "<p>This is an AI-generated answer based on your text input.</p>",
            deckId: selectedDeck,
            deckName: deckName,
            title: `${deckName} Concept`,
            createdAt: new Date(),
            lastReviewed: null,
            nextReview: new Date(),
            difficulty: 0.5
          },
          {
            id: `card-${Date.now()}-2`,
            question: `<p>How would you explain ${inputText.substring(0, 20)}... in simple terms?</p>`,
            answer: "<p>This is another AI-generated answer for your flashcard.</p>",
            deckId: selectedDeck,
            deckName: deckName,
            title: `${deckName} Explanation`,
            createdAt: new Date(),
            lastReviewed: null,
            nextReview: new Date(),
            difficulty: 0.5
          }
        ];
      } else if (mediaType !== 'none') {
        // Generate cards from media
        newCards = [
          {
            id: `card-${Date.now()}-media`,
            question: `<p>What is shown in this ${mediaType}?</p>`,
            answer: "<p>This is an AI description of the media content.</p>",
            deckId: selectedDeck,
            deckName: deckName,
            title: `${deckName} Media`,
            createdAt: new Date(),
            lastReviewed: null,
            nextReview: new Date(),
            difficulty: 0.5,
            media: { 
              type: mediaType === 'youtube' ? 'youtube' : (mediaType === 'video' ? 'video' : 'image'), 
              url: mediaUrl 
            }
          }
        ];
      }
      
      // Save the generated cards to state and flashcard store
      setGeneratedCards(newCards);
      
      // Add cards to the flashcard store
      newCards.forEach(card => {
        addFlashcard(card);
      });
      
      setIsGenerating(false);
      
      // Reset after generation
      setUploadedFile(null);
    }, 2000);
  };

  return {
    isGenerating,
    generatedCards,
    isFileProcessing,
    uploadedFile,
    setUploadedFile,
    handleFileUpload,
    generateFlashcards,
    fileValidationError,
    setFileValidationError
  };
}
