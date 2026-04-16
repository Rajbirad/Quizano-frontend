
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { ImageOcclusionProps } from './occlusion/types';
import { OcclusionControls } from './occlusion/OcclusionControls';
import { OcclusionAreasList } from './occlusion/OcclusionAreasList';
import { OcclusionContainer } from './occlusion/OcclusionContainer';
import { useImageOcclusion } from './occlusion/useImageOcclusion';

export const ImageOcclusion: React.FC<ImageOcclusionProps> = ({ 
  imageUrl, 
  onSaveOcclusions 
}) => {
  const {
    rects,
    selectedRect,
    showLabels,
    setSelectedRect,
    setShowLabels,
    handleAddRect,
    handleUpdateLabel,
    handleDeleteRect,
    handleSave
  } = useImageOcclusion(imageUrl, onSaveOcclusions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Image Occlusion
        </CardTitle>
        <CardDescription>
          Create flashcards by hiding parts of your image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OcclusionControls 
          showLabels={showLabels}
          toggleLabels={() => setShowLabels(!showLabels)}
          handleSave={handleSave}
          rectsCount={rects.length}
        />
        
        <OcclusionContainer
          imageUrl={imageUrl}
          rects={rects}
          selectedRect={selectedRect}
          showLabels={showLabels}
          onSelectRect={setSelectedRect}
          onAddRect={handleAddRect}
        />
        
        <OcclusionAreasList 
          rects={rects}
          selectedRect={selectedRect}
          onSelectRect={setSelectedRect}
          onUpdateLabel={handleUpdateLabel}
          onDeleteRect={handleDeleteRect}
        />
      </CardContent>
    </Card>
  );
};
