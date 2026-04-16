import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';

interface ProfileAvatarProps {
  user: User | null;
  profile: any;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  user, 
  profile,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (profile?.avatar_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = profile.avatar_url;
    }
  }, [profile?.avatar_url]);

  const getFallbackText = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <Avatar className={className}>
      {profile?.avatar_url && !imageError ? (
        <AvatarImage
          src={profile.avatar_url}
          className="rounded-lg object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
      ) : null}
      <AvatarFallback className="rounded-lg">
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
};
