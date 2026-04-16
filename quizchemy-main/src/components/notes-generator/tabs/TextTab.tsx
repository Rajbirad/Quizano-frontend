import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextTabProps {
  textInput: string;
  setTextInput: (text: string) => void;
  validationError?: string;
  setValidationError?: (error: string) => void;
}

export const TextTab: React.FC<TextTabProps> = ({ textInput, setTextInput, validationError, setValidationError }) => {
  const validateText = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return "Please enter some text to generate notes from.";
    }

    if (trimmedText.length < 100) {
      return "Please enter at least 100 characters for better note generation.";
    }

    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 20) {
      return "Please enter at least 20 words for meaningful note generation.";
    }

    return "";
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextInput(text);
    if (setValidationError) {
      setValidationError(validateText(text));
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Paste your text content here (minimum 100 characters or 20 words). This could be an article, research paper, study material, lecture notes, or any text you want to convert into structured notes..."
        className={`min-h-[300px] w-full resize-none border-2 rounded-3xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${validationError ? 'border-red-500' : 'border-gray-300'}`}
        value={textInput}
        onChange={handleTextChange}
      />
      {validationError && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}
    </div>
  );
};