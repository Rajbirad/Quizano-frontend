import React from 'react';
import { Button } from '@/components/ui/button';

// Import all avatar images
const avatarImports = import.meta.glob('@/assets/avatars/*.svg', { eager: true });
const defaultAvatars = Object.values(avatarImports).map(module => (module as any).default);

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onAvatarSelect: (avatarUrl: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect,
  onSave,
  saving
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm text-muted-foreground">Or choose an avatar</h3>
      
      <div className="grid grid-cols-10 gap-3 p-4 border rounded-lg bg-muted/20">
        {defaultAvatars.slice(0, 20).map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`
              w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110
              ${selectedAvatar === avatar ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
            `}
            type="button"
          >
            <img
              src={avatar}
              alt={`Avatar ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {selectedAvatar && (
        <Button 
          onClick={onSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 rounded-md px-6 py-2 font-medium text-white w-auto"
        >
          Save Picture
        </Button>
      )}
    </div>
  );
};