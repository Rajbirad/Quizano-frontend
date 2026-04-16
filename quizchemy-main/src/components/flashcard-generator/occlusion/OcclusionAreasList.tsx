
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { OcclusionRect } from './types';

interface OcclusionAreasListProps {
  rects: OcclusionRect[];
  selectedRect: string | null;
  onSelectRect: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onDeleteRect: (id: string) => void;
}

export const OcclusionAreasList: React.FC<OcclusionAreasListProps> = ({
  rects,
  selectedRect,
  onSelectRect,
  onUpdateLabel,
  onDeleteRect
}) => {
  if (rects.length === 0) return null;
  
  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Occlusion Areas</h3>
      
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {rects.map((rect) => (
          <div 
            key={rect.id} 
            className={`flex items-center gap-2 p-2 border rounded-md ${
              selectedRect === rect.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectRect(rect.id)}
          >
            <Input
              value={rect.label}
              onChange={(e) => onUpdateLabel(rect.id, e.target.value)}
              className="flex-1 text-sm h-8"
              placeholder="Label"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRect(rect.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
