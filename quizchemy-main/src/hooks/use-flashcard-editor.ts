
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useFlashcardEditor() {
  const [title, setTitle] = useState('');
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedDeck, setSelectedDeck] = useState('general');
  const { toast } = useToast();
  
  // Media state
  const [frontMediaType, setFrontMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [frontMediaUrl, setFrontMediaUrl] = useState('');
  const [backMediaType, setBackMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [backMediaUrl, setBackMediaUrl] = useState('');
  
  // When switching to preview tab, ensure activeTab state is updated
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleFrontMediaChange = (type: 'none' | 'image' | 'video' | 'youtube', url: string) => {
    setFrontMediaType(type);
    setFrontMediaUrl(url);
  };
  
  const handleBackMediaChange = (type: 'none' | 'image' | 'video' | 'youtube', url: string) => {
    setBackMediaType(type);
    setBackMediaUrl(url);
  };
  
  const handleClearFrontMedia = () => {
    setFrontMediaType('none');
    setFrontMediaUrl('');
  };
  
  const handleClearBackMedia = () => {
    setBackMediaType('none');
    setBackMediaUrl('');
  };

  return {
    title,
    setTitle,
    frontContent,
    setFrontContent,
    backContent,
    setBackContent,
    saving,
    setSaving,
    activeTab,
    setActiveTab: handleTabChange,
    selectedDeck,
    setSelectedDeck,
    frontMediaType,
    frontMediaUrl,
    backMediaType,
    backMediaUrl,
    handleFrontMediaChange,
    handleBackMediaChange,
    handleClearFrontMedia,
    handleClearBackMedia
  };
}
