
import React, { useRef } from 'react';

export interface TextFormatterProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  onUndoStateChange?: (hasUndo: boolean) => void;
  onRedoStateChange?: (hasRedo: boolean) => void;
  undoStack: string[];
  setUndoStack: React.Dispatch<React.SetStateAction<string[]>>;
  redoStack: string[];
  setRedoStack: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useTextFormatter = ({
  content,
  onContentChange,
  placeholder = "Enter content...",
  undoStack,
  setUndoStack,
  redoStack,
  setRedoStack,
}: TextFormatterProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Save current state for undo
    setUndoStack(prev => [...prev, content]);
    setRedoStack([]);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);

    let newContent = '';
    let newCursorPosition = start;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newContent = beforeSelection + '**' + selectedText + '**' + afterSelection;
          newCursorPosition = end + 4;
        } else {
          const placeholder = 'bold text';
          newContent = beforeSelection + '**' + placeholder + '**' + afterSelection;
          // Select the placeholder text
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
            }
          }, 0);
        }
        break;
        
      case 'italic':
        if (selectedText) {
          newContent = beforeSelection + '*' + selectedText + '*' + afterSelection;
          newCursorPosition = end + 2;
        } else {
          const placeholder = 'italic text';
          newContent = beforeSelection + '*' + placeholder + '*' + afterSelection;
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(start + 1, start + 1 + placeholder.length);
            }
          }, 0);
        }
        break;
        
      case 'underline':
        if (selectedText) {
          newContent = beforeSelection + '__' + selectedText + '__' + afterSelection;
          newCursorPosition = end + 4;
        } else {
          const placeholder = 'underlined text';
          newContent = beforeSelection + '__' + placeholder + '__' + afterSelection;
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
            }
          }, 0);
        }
        break;
        
      case 'highlight':
        if (selectedText) {
          newContent = beforeSelection + '==' + selectedText + '==' + afterSelection;
          newCursorPosition = end + 4;
        } else {
          const placeholder = 'highlighted text';
          newContent = beforeSelection + '==' + placeholder + '==' + afterSelection;
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
            }
          }, 0);
        }
        break;
        
      case 'code':
        if (selectedText) {
          newContent = beforeSelection + '`' + selectedText + '`' + afterSelection;
          newCursorPosition = end + 2;
        } else {
          const placeholder = 'code';
          newContent = beforeSelection + '`' + placeholder + '`' + afterSelection;
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(start + 1, start + 1 + placeholder.length);
            }
          }, 0);
        }
        break;
        
      case 'ordered-list':
        const lines = selectedText ? selectedText.split('\n') : [''];
        const numberedLines = lines.map((line, index) => `${index + 1}. ${line.trim()}`);
        newContent = beforeSelection + numberedLines.join('\n') + afterSelection;
        newCursorPosition = start + numberedLines.join('\n').length;
        break;
        
      case 'unordered-list':
        const listLines = selectedText ? selectedText.split('\n') : [''];
        const bulletLines = listLines.map(line => `- ${line.trim()}`);
        newContent = beforeSelection + bulletLines.join('\n') + afterSelection;
        newCursorPosition = start + bulletLines.join('\n').length;
        break;
        
      default:
        return;
    }

    onContentChange(newContent);

    // Set cursor position after formatting
    if (!['bold', 'italic', 'underline', 'highlight', 'code'].includes(format) || selectedText) {
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      setUndoStack(newUndoStack);
      setRedoStack(prev => [content, ...prev]);
      onContentChange(previousState);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      const newRedoStack = redoStack.slice(1);
      setRedoStack(newRedoStack);
      setUndoStack(prev => [...prev, content]);
      onContentChange(nextState);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  return { 
    textareaRef, 
    handleFormat, 
    handleUndo, 
    handleRedo 
  };
};
