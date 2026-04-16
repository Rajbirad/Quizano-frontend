
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { FlashcardFormItem } from './FlashcardFormItem';

interface FlashcardForm {
  id: string;  // Changed to string to match API response
  frontContent: string;
  backContent: string;
  frontMediaType: 'none' | 'image' | 'video' | 'youtube';
  frontMediaUrl: string;
  backMediaType: 'none' | 'image' | 'video' | 'youtube';
  backMediaUrl: string;
  hint?: string;  // Added hint field
}

interface FlashcardFormsListProps {
  flashcardForms: FlashcardForm[];
  handleUpdateFormField: (id: string, field: string, value: string | 'none' | 'image' | 'video' | 'youtube') => void;
  handleMoveCard: (id: string, direction: 'up' | 'down') => void;
  handleRemoveCard: (id: string) => void;
  handleResetCard: (id: string) => void;
}

export const FlashcardFormsList: React.FC<FlashcardFormsListProps> = ({
  flashcardForms,
  handleUpdateFormField,
  handleMoveCard,
  handleRemoveCard,
  handleResetCard
}) => {
  return (
    <TabsContent value="edit" className="space-y-6">
      {flashcardForms.map((form, index) => (
        <FlashcardFormItem
          key={form.id}
          id={form.id}
          index={index}
          formCount={flashcardForms.length}
          frontContent={form.frontContent}
          backContent={form.backContent}
          frontMediaType={form.frontMediaType}
          frontMediaUrl={form.frontMediaUrl}
          backMediaType={form.backMediaType}
          backMediaUrl={form.backMediaUrl}
          onFrontContentChange={(content) => handleUpdateFormField(form.id, 'frontContent', content)}
          onBackContentChange={(content) => handleUpdateFormField(form.id, 'backContent', content)}
          onFrontMediaChange={(type, url) => {
            handleUpdateFormField(form.id, 'frontMediaType', type);
            handleUpdateFormField(form.id, 'frontMediaUrl', url);
          }}
          onBackMediaChange={(type, url) => {
            handleUpdateFormField(form.id, 'backMediaType', type);
            handleUpdateFormField(form.id, 'backMediaUrl', url);
          }}
          onClearFrontMedia={() => {
            handleUpdateFormField(form.id, 'frontMediaType', 'none');
            handleUpdateFormField(form.id, 'frontMediaUrl', '');
          }}
          onClearBackMedia={() => {
            handleUpdateFormField(form.id, 'backMediaType', 'none');
            handleUpdateFormField(form.id, 'backMediaUrl', '');
          }}
          onMoveCard={handleMoveCard}
          onRemoveCard={handleRemoveCard}
          onResetCard={handleResetCard}
        />
      ))}
    </TabsContent>
  );
};
