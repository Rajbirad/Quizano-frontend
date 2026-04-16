import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { X, Trash2, Bold, Italic, Underline, List, ListOrdered, Strikethrough, Undo, Redo, Image } from 'lucide-react';

interface FlashcardFormItemProps {
  id: string;
  index: number;
  formCount: number;
  frontContent: string;
  backContent: string;
  frontMediaType: 'none' | 'image' | 'video' | 'youtube';
  frontMediaUrl: string;
  backMediaType: 'none' | 'image' | 'video' | 'youtube';
  backMediaUrl: string;
  onFrontContentChange: (content: string) => void;
  onBackContentChange: (content: string) => void;
  onFrontMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onBackMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onClearFrontMedia: () => void;
  onClearBackMedia: () => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
  onRemoveCard: (id: string) => void;
  onResetCard: (id: string) => void;
}

export const FlashcardFormItem: React.FC<FlashcardFormItemProps> = ({
  id,
  index,
  formCount,
  frontContent,
  backContent,
  frontMediaType,
  frontMediaUrl,
  backMediaType,
  backMediaUrl,
  onFrontContentChange,
  onBackContentChange,
  onFrontMediaChange,
  onBackMediaChange,
  onClearFrontMedia,
  onClearBackMedia,
  onMoveCard,
  onRemoveCard,
  onResetCard,
}) => {
  const [activeEditor, setActiveEditor] = useState<'front' | 'back' | null>(null);

  const frontEditorRef = useRef<HTMLDivElement>(null);
  const backEditorRef = useRef<HTMLDivElement>(null);
  const frontImageRef = useRef<HTMLInputElement>(null);
  const backImageRef = useRef<HTMLInputElement>(null);

  // helper: set innerHTML only if different
  const setHTMLIfChanged = (el: HTMLDivElement | null, html: string) => {
    if (el && el.innerHTML !== (html ?? '')) {
      el.innerHTML = html ?? '';
    }
  };

  // ---- Sync props -> DOM ONLY when that editor isn't active (prevents caret reset) ----
  useEffect(() => {
    if (activeEditor !== 'front') {
      setHTMLIfChanged(frontEditorRef.current, frontContent || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontContent, activeEditor]);

  useEffect(() => {
    if (activeEditor !== 'back') {
      setHTMLIfChanged(backEditorRef.current, backContent || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backContent, activeEditor]);

  const handleFormat = useCallback(
    (format: string) => {
      const editor =
        activeEditor === 'front' ? frontEditorRef.current : activeEditor === 'back' ? backEditorRef.current : null;
      if (!editor) return;

      editor.focus();

      setTimeout(() => {
        try {
          const selection = window.getSelection();
          let range: Range | null = null;
          if (selection && selection.rangeCount > 0) range = selection.getRangeAt(0);

          let success = false;
          switch (format) {
            case 'bold':
              success = document.execCommand('bold', false, null);
              break;
            case 'italic':
              success = document.execCommand('italic', false, null);
              break;
            case 'underline':
              success = document.execCommand('underline', false, null);
              break;
            case 'strikethrough':
              success = document.execCommand('strikeThrough', false, null);
              break;
            case 'unordered-list':
              success = document.execCommand('insertUnorderedList', false, null);
              if (!success && range) {
                const li = document.createElement('li');
                const ul = document.createElement('ul');
                if (range.collapsed) {
                  li.innerHTML = '&nbsp;';
                  ul.appendChild(li);
                  range.insertNode(ul);
                } else {
                  li.appendChild(range.extractContents());
                  ul.appendChild(li);
                  range.insertNode(ul);
                }
                success = true;
              }
              break;
            case 'ordered-list':
              success = document.execCommand('insertOrderedList', false, null);
              if (!success && range) {
                const li = document.createElement('li');
                const ol = document.createElement('ol');
                if (range.collapsed) {
                  li.innerHTML = '&nbsp;';
                  ol.appendChild(li);
                  range.insertNode(ol);
                } else {
                  li.appendChild(range.extractContents());
                  ol.appendChild(li);
                  range.insertNode(ol);
                }
                success = true;
              }
              break;
            case 'undo':
              success = document.execCommand('undo', false, null);
              break;
            case 'redo':
              success = document.execCommand('redo', false, null);
              break;
          }

          // push formatted HTML to parent
          const html = editor.innerHTML;
          if (activeEditor === 'front') {
            onFrontContentChange(html);
          } else if (activeEditor === 'back') {
            onBackContentChange(html);
          }
        } catch (e) {
          console.error('Formatting error:', e);
        }
      }, 0);
    },
    [activeEditor, onFrontContentChange, onBackContentChange]
  );

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload image to server using authenticated request
      const response = await makeAuthenticatedFormRequest('/api/upload-image', formData);

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (data.success && data.url) {
        // Update the media with the permanent URL from Supabase
        if (side === 'front') {
          onFrontMediaChange('image', data.url);
        } else {
          onBackMediaChange('image', data.url);
        }
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (side === 'front') {
        onClearFrontMedia();
      } else {
        onClearBackMedia();
      }
    }
  };

  return (
    <div className="relative border-2 rounded-lg p-6 bg-background">
      {/* Card number indicator */}
      <div className="absolute -top-3 left-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
          {index + 1}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveCard(id)}
          disabled={formCount <= 1}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-center mb-6 mt-4">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('unordered-list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('ordered-list')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('strikethrough')}>
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('undo')}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('redo')}>
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Front of Card</h3>
          <div className="relative border rounded-lg p-4 min-h-[150px] bg-muted/30">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => frontImageRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-muted/50 transition-colors cursor-pointer bg-background relative"
              >
                {frontMediaUrl && frontMediaType === 'image' ? (
                  <img src={frontMediaUrl} alt="Front card" className="object-cover w-full h-full rounded-lg" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground/60" />
                )}
                <input ref={frontImageRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'front')} className="hidden" />
                {frontMediaUrl && frontMediaType === 'image' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearFrontMedia();
                      if (frontImageRef.current) frontImageRef.current.value = '';
                    }}
                    className="absolute top-0 right-0 h-5 w-5 p-0 bg-background/80 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </button>

              <div
                ref={frontEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 bg-transparent border-none outline-none resize-none min-h-[40px] text-foreground leading-relaxed text-base"
                style={{
                  direction: 'ltr',
                  unicodeBidi: 'plaintext',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
                onInput={e => {
                  const html = (e.currentTarget as HTMLDivElement).innerHTML;
                  onFrontContentChange(html);
                }}
                onFocus={() => setActiveEditor('front')}
                onBlur={() => setActiveEditor(null)}
                data-placeholder="Enter the front content of your flashcard..."
              />
            </div>
          </div>
        </div>

        {/* Back */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Back of Card</h3>
          <div className="relative border rounded-lg p-4 min-h-[150px] bg-muted/30">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => backImageRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-muted/50 transition-colors cursor-pointer bg-background relative"
              >
                {backMediaUrl && backMediaType === 'image' ? (
                  <img src={backMediaUrl} alt="Back card" className="object-cover w-full h-full rounded-lg" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground/60" />
                )}
                <input ref={backImageRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'back')} className="hidden" />
                {backMediaUrl && backMediaType === 'image' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearBackMedia();
                      if (backImageRef.current) backImageRef.current.value = '';
                    }}
                    className="absolute top-0 right-0 h-5 w-5 p-0 bg-background/80 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </button>

              <div
                ref={backEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 bg-transparent border-none outline-none resize-none min-h-[40px] text-foreground leading-relaxed text-base"
                style={{
                  direction: 'ltr',
                  unicodeBidi: 'plaintext',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
                onInput={e => {
                  const html = (e.currentTarget as HTMLDivElement).innerHTML;
                  onBackContentChange(html);
                }}
                onFocus={() => setActiveEditor('back')}
                onBlur={() => setActiveEditor(null)}
                data-placeholder="Enter the back content of your flashcard..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
