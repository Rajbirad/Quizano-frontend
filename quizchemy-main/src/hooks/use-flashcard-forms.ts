
import { updateFlashcards, BatchFlashcardUpdate } from '@/lib/api-utils';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface FlashcardForm {
  id: string;  // Changed to string to match API response
  frontContent: string;
  backContent: string;
  hint?: string;
  frontMediaType: 'none' | 'image' | 'video' | 'youtube';
  frontMediaUrl: string;
  backMediaType: 'none' | 'image' | 'video' | 'youtube';
  backMediaUrl: string;
}

function createEmptyForm(id: string = '0'): FlashcardForm {
  return {
    id,
    frontContent: '',
    backContent: '',
    hint: '',
    frontMediaType: 'none',
    frontMediaUrl: '',
    backMediaType: 'none',
    backMediaUrl: ''
  };
}

export function useFlashcardForms(initialFlashcards?: any[]) {
  const location = useLocation();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize forms with initial data or empty forms
  const [flashcardForms, setFlashcardForms] = useState<FlashcardForm[]>(() => {
    if (!initialFlashcards?.length) {
      return [createEmptyForm()];
    }

    return initialFlashcards.map((card) => {
      console.log('Initializing form with card:', card);
      return {
        id: card.id,  // Use the API-provided ID
        frontContent: card.front || card.frontContent || '',  // Prioritize front over frontContent
        backContent: card.back || card.backContent || '',     // Prioritize back over backContent
        hint: card.hint || '',
        frontMedia: card.frontMedia || null,
        backMedia: card.backMedia || null
      };
    });
  });

  const handleAddForm = () => {
    const newForm = {
      id: crypto.randomUUID(),
      frontContent: '',
      backContent: '',
      hint: '',
      frontMedia: null,
      backMedia: null
    };
    
    setFlashcardForms(forms => [...forms, newForm]);
    setHasUnsavedChanges(true);
    console.log('Added new form:', newForm);
    return newForm;
  };

  const handleRemoveForm = (id: string) => {
    if (flashcardForms.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one flashcard",
        variant: "destructive"
      });
      return;
    }
    setFlashcardForms(forms => forms.filter(form => form.id !== id));
    setHasUnsavedChanges(true);
    console.log('Removed form:', id);
  };

  const handleMoveForm = (id: string, direction: 'up' | 'down') => {
    const index = flashcardForms.findIndex(form => form.id === id);
    if (index === -1) return;
    
    const newForms = [...flashcardForms];
    
    if (direction === 'up' && index > 0) {
      [newForms[index], newForms[index - 1]] = [newForms[index - 1], newForms[index]];
    } else if (direction === 'down' && index < flashcardForms.length - 1) {
      [newForms[index], newForms[index + 1]] = [newForms[index + 1], newForms[index]];
    }
    
    setFlashcardForms(newForms);
    setHasUnsavedChanges(true);
    console.log('Moved form:', { id, direction, newOrder: newForms.map(f => f.id) });
  };

  const handleResetForm = (id: string) => {
    setFlashcardForms(forms => 
      forms.map(form => 
        form.id === id ? {
          ...form,
          frontContent: '',
          backContent: '',
          hint: '',
          frontMediaType: 'none' as const,
          frontMediaUrl: '',
          backMediaType: 'none' as const,
          backMediaUrl: ''
        } : form
      )
    );
    setHasUnsavedChanges(true);
    console.log('Reset form:', id);
  };

  const handleUpdateFormField = (cardForm: FlashcardForm, field: string, value: string | boolean) => {
    if (typeof value === 'string') {
      // Log the update request
      console.log('Form field update requested:', {
        cardId: cardForm.id,
        field,
        oldValue: cardForm[field],
        newValue: value,
        timestamp: new Date().toISOString()
      });
      
      // Update state immutably and immediately
      setFlashcardForms(currentForms => {
        const updatedForms = currentForms.map(form => {
          if (form.id === cardForm.id) {
            const updatedForm = { ...form, [field]: value };
            // Log individual form update
            console.log('Updating individual form:', {
              id: form.id,
              field,
              oldValue: form[field],
              newValue: value,
              fullForm: updatedForm
            });
            return updatedForm;
          }
          return form;
        });
        
        // Log the complete state update
        console.log('Forms state update:', {
          totalForms: updatedForms.length,
          updatedFormId: cardForm.id,
          updatedField: field,
          timestamp: new Date().toISOString(),
          allForms: updatedForms
        });
        
        return updatedForms;
      });

      // Mark changes as unsaved
      setHasUnsavedChanges(true);
    }
  };

  return {
    flashcardForms,
    handleAddForm,
    handleRemoveForm,
    handleMoveForm,
    handleResetForm,
    handleUpdateFormField,
    hasUnsavedChanges
  };
}
