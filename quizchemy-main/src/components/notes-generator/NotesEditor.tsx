
import React, { useRef, useState, useEffect } from 'react';
import { Note } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { EditorToolbar } from './EditorToolbar';
import { EditorContent } from './EditorContent';
import { EditorActionButtons } from './EditorActionButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronsLeft, ChevronsRight, Brain } from 'lucide-react';
import { InsertMenu } from './InsertMenu';
import { Toggle } from '@/components/ui/toggle';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { AiSummarization } from './AiSummarization';

interface NotesEditorProps {
  note: Note;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onShare: () => void;
  onRemind: () => void;
  onColor: () => void;
  onAddTag: (noteId: string, tag: string) => void;
  onRemoveTag: (noteId: string, tag: string) => void;
  onMinimizeNotesList?: () => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  note,
  onUpdateNote,
  onShare,
  onRemind,
  onColor,
  onAddTag,
  onRemoveTag,
  onMinimizeNotesList
}) => {
  const [content, setContent] = useState(note.content);
  const [activeTab, setActiveTab] = useState('edit');
  const [newTag, setNewTag] = useState('');
  const [insertMenuPosition, setInsertMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const editorRef = useRef<HTMLDivElement>(null);
  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // When note changes, update content
  useEffect(() => {
    setContent(note.content);
    
    // Only focus on title input on initial render, not during content edits
    if (isInitialRender && titleInputRef.current) {
      titleInputRef.current.focus();
      setIsInitialRender(false);
    }
  }, [note, isInitialRender]);

  // Save content when it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (content !== note.content) {
        onUpdateNote(note.id, { content });
        
        // Auto-tagging based on content
        handleAutoTagging(content);
      }
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [content, note.id, note.content, onUpdateNote]);

  // Reset isInitialRender when note changes
  useEffect(() => {
    setIsInitialRender(true);
  }, [note.id]);

  // Function to handle auto-tagging
  const handleAutoTagging = async (noteContent: string) => {
    // Check if content has enough text to analyze
    if (noteContent.length > 30) {
      try {
        // Import the AI service for generating tags
        const { generateTags } = await import('@/lib/ai-services');
        
        // Get AI-generated tags
        const suggestedTags = await generateTags(noteContent);
        
        // Add tags that don't already exist
        suggestedTags.forEach(tag => {
          if (note.tags && !note.tags.includes(tag)) {
            onAddTag(note.id, tag);
          }
        });
      } catch (error) {
        console.error('Error generating tags:', error);
      }
    }
  };

  const handleSelectionChange = () => {
    // This can be used for formatting selections or getting cursor position
  };
  
  const handleExecCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Get updated content after executing command
      setContent(editorRef.current.innerHTML);
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent focusing on editor when title changes
    e.stopPropagation();
    onUpdateNote(note.id, { title: e.target.value });
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(note.id, newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Show insert menu on slash command
    if (e.key === '/' && editorRef.current) {
      e.preventDefault();
      
      // Get cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position the menu below the cursor
        setInsertMenuPosition({
          x: rect.left,
          y: rect.bottom + window.scrollY
        });
      }
    }
  };

  const handleCloseInsertMenu = () => {
    setInsertMenuPosition(null);
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleInsertElement = (elementType: string) => {
    switch (elementType) {
      case 'heading':
        handleExecCommand('formatBlock', '<h2>');
        break;
      case 'bullet-list':
        handleExecCommand('insertUnorderedList');
        break;
      case 'numbered-list':
        handleExecCommand('insertOrderedList');
        break;
      case 'todo-list':
        handleExecCommand('insertHTML', '<div class="task-item"><input type="checkbox"> Task item</div>');
        break;
      case 'table':
        handleExecCommand('insertHTML', '<table class="border-collapse border border-slate-400 w-full my-4"><thead><tr><th class="border border-slate-300 p-2">Header 1</th><th class="border border-slate-300 p-2">Header 2</th></tr></thead><tbody><tr><td class="border border-slate-300 p-2">Cell 1</td><td class="border border-slate-300 p-2">Cell 2</td></tr><tr><td class="border border-slate-300 p-2">Cell 3</td><td class="border border-slate-300 p-2">Cell 4</td></tr></tbody></table>');
        break;
      case 'code-block':
        handleExecCommand('insertHTML', '<pre><code>// Code block\nfunction example() {\n  return "Hello world";\n}</code></pre>');
        break;
      case 'image':
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) {
          handleExecCommand('insertImage', imgUrl);
        }
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          handleExecCommand('createLink', url);
        }
        break;
      case 'blockquote':
        handleExecCommand('formatBlock', '<blockquote>');
        break;
      case 'horizontal-rule':
        handleExecCommand('insertHorizontalRule');
        break;
      case 'math':
        handleExecCommand('insertHTML', '<span class="math-formula">E = mc<sup>2</sup></span>');
        break;
      case 'emoji':
        handleExecCommand('insertText', '😊');
        break;
      default:
        break;
    }
  };

  const handleApplySummary = (summary: string) => {
    // Apply the AI-generated summary to the note content
    setContent(summary);
  };

  const handleMinimizeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    if (onMinimizeNotesList) {
      onMinimizeNotesList();
    }
  };

  // Don't focus editor when clicking anywhere in the component
  const handleEditorWrapperClick = (e: React.MouseEvent) => {
    // Only allow clicking inside the editor to focus it
    if (e.target === editorRef.current || editorRef.current?.contains(e.target as Node)) {
      return;
    }
    
    // Prevent focus on editor when clicking elsewhere
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col h-full" onClick={handleEditorWrapperClick}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          {onMinimizeNotesList && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={handleMinimizeClick}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}
          <Input
            ref={titleInputRef}
            value={note.title}
            onChange={handleTitleChange}
            className="text-xl font-semibold border-none px-0 focus-visible:ring-0 flex-1"
            placeholder="Note title"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <EditorActionButtons 
            note={note}
            onShare={onShare}
            onRemind={onRemind}
            onColor={onColor}
          />
          
          <AiSummarization 
            noteContent={content}
            onApplySummary={handleApplySummary}
          />
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <div className="flex items-center px-4">
          <div className="flex space-x-1 mr-auto">
            <Toggle 
              pressed={viewMode === 'edit'} 
              onPressedChange={() => setViewMode('edit')}
              className="h-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              Edit
            </Toggle>
            <Toggle 
              pressed={viewMode === 'preview'} 
              onPressedChange={() => setViewMode('preview')}
              className="h-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              Preview
            </Toggle>
            <Toggle 
              pressed={viewMode === 'split'} 
              onPressedChange={() => setViewMode('split')}
              className="h-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              Split
            </Toggle>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-10">
            <TabsList className="h-10">
              <TabsTrigger value="edit" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                Edit
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                Backlinks (0)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {viewMode !== 'preview' && (
        <div className="px-4 py-2 border-b border-gray-200">
          <EditorToolbar execCommand={handleExecCommand} />
        </div>
      )}
      
      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <TabsContent value="edit" className="flex-1 p-4 flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2">
            {note.tags && note.tags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-gray-100">
                #{tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => onRemoveTag(note.id, tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            
            <form onSubmit={handleTagSubmit} className="inline-flex">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="h-7 text-xs bg-transparent border-none py-0 px-2 focus-visible:ring-0"
              />
            </form>
          </div>
          
          {viewMode === 'split' ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full p-4 overflow-auto">
                  <textarea
                    ref={markdownEditorRef}
                    value={content}
                    onChange={handleMarkdownChange}
                    className="w-full h-full p-2 font-mono text-sm resize-none border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full p-4 overflow-auto prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex-1 overflow-auto">
              <EditorContent
                editorRef={editorRef}
                content={content}
                setContent={setContent}
                onSelectionChange={handleSelectionChange}
                onKeyDown={handleKeyDown}
                viewMode={viewMode}
                markdownEditorRef={markdownEditorRef}
                onMarkdownChange={handleMarkdownChange}
              />
            </div>
          )}
          
          {insertMenuPosition && (
            <InsertMenu
              position={insertMenuPosition}
              onClose={handleCloseInsertMenu}
              onSelect={handleInsertElement}
            />
          )}
        </TabsContent>
        
        <TabsContent value="backlinks" className="flex-1 p-4 overflow-auto">
          <div className="text-center py-12 text-gray-500">
            <p>No backlinks to this note</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
