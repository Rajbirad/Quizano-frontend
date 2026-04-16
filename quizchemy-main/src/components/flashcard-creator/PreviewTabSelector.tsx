import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutIcon, Sparkles } from 'lucide-react';
interface PreviewTabSelectorProps {
  createdFlashcardsCount: number;
}
export const PreviewTabSelector: React.FC<PreviewTabSelectorProps> = ({
  createdFlashcardsCount
}) => {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="edit" className="flex items-center gap-2">
        <LayoutIcon className="h-4 w-4" />
        Edit Cards
      </TabsTrigger>
      <TabsTrigger value="preview" className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        Preview ({createdFlashcardsCount})
      </TabsTrigger>
    </TabsList>
  );
};