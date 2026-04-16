
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags?: string[];
  isPinned: boolean;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
  color?: 'default' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow';
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
}
