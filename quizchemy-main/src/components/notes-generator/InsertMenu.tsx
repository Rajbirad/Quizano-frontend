
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  List, ListOrdered, Table, Code, CheckSquare, Heading2, Image, Link,
  Quote, Minus, Calculator, Smile
} from 'lucide-react';

interface InsertMenuProps {
  position: { x: number, y: number };
  onClose: () => void;
  onSelect: (elementType: string) => void;
  children?: React.ReactNode;
}

export const InsertMenu: React.FC<InsertMenuProps> = ({
  position,
  onClose,
  onSelect,
  children
}) => {
  const handleSelect = (type: string) => {
    onSelect(type);
    onClose();
  };

  // Use an array of menu items for easier management
  const menuItems = [
    { id: 'heading', icon: Heading2, label: 'Heading' },
    { id: 'bullet-list', icon: List, label: 'Bullet List' },
    { id: 'numbered-list', icon: ListOrdered, label: 'Numbered List' },
    { id: 'todo-list', icon: CheckSquare, label: 'Task List' },
    { id: 'table', icon: Table, label: 'Table' },
    { id: 'code-block', icon: Code, label: 'Code Block' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'link', icon: Link, label: 'Link' },
    { id: 'blockquote', icon: Quote, label: 'Blockquote' },
    { id: 'horizontal-rule', icon: Minus, label: 'Horizontal Rule' },
    { id: 'math', icon: Calculator, label: 'Math Formula' },
    { id: 'emoji', icon: Smile, label: 'Emoji' },
  ];

  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-56 p-2 animate-in fade-in-10 zoom-in-95"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => handleSelect(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
      {children}
    </div>
  );
};
