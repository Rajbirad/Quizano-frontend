
import { ReactNode } from 'react';

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'summary' | 'keypoints' | 'flashcards' | 'translation' | 'error';
  data?: any;
};

export type QuickAction = {
  id: string;
  name: string;
  icon: ReactNode;
  prompt: string;
};

export type FileType = {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
};
