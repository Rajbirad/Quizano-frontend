
import React, { useState, useRef, useCallback } from 'react';
import { FormattingToolbar } from './FormattingToolbar';
import { useMediaHandler } from './MediaHandler';
import { MediaInputs } from './MediaInputs';

export interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  mediaType?: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl?: string;
  onMediaChange?: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onClearMedia?: () => void;
  placeholder?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onContentChange,
  mediaType = 'none',
  mediaUrl = '',
  onMediaChange,
  onClearMedia,
  placeholder = "Enter content..."
}) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Use the MediaHandler hook for handling media functionality
  const { 
    fileInputRef, 
    handleMediaUpload, 
    renderMediaPreview 
  } = useMediaHandler({
    onMediaChange,
    mediaType,
    mediaUrl,
    onClearMedia
  });

  const handleFormat = useCallback((format: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    
    try {
      switch (format) {
        case 'bold':
          // Use modern approach for better browser compatibility
          if (document.queryCommandSupported && document.queryCommandSupported('bold')) {
            document.execCommand('bold', false, null);
          } else {
            toggleInlineStyle('font-weight', 'bold', 'normal');
          }
          break;
        case 'italic':
          if (document.queryCommandSupported && document.queryCommandSupported('italic')) {
            document.execCommand('italic', false, null);
          } else {
            toggleInlineStyle('font-style', 'italic', 'normal');
          }
          break;
        case 'underline':
          if (document.queryCommandSupported && document.queryCommandSupported('underline')) {
            document.execCommand('underline', false, null);
          } else {
            toggleInlineStyle('text-decoration', 'underline', 'none');
          }
          break;
        case 'highlight':
          applyHighlight();
          break;
        case 'ordered-list':
          insertSimpleList('ol');
          break;
        case 'unordered-list':
          insertSimpleList('ul');
          break;
      }
      
      // Update content after formatting
      setTimeout(() => {
        onContentChange(editor.innerHTML);
      }, 10);
    } catch (error) {
      console.error('Formatting error:', error);
    }
  }, [onContentChange]);

  // Fallback method for browsers that don't support execCommand
  const toggleInlineStyle = (property: string, activeValue: string, inactiveValue: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement('span');
    span.style.setProperty(property, activeValue);
    
    try {
      range.surroundContents(span);
    } catch (e) {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
    
    selection.removeAllRanges();
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No text selected
    
    // Check if the selected text is already highlighted
    const commonAncestor = range.commonAncestorContainer;
    let isHighlighted = false;
    let highlightElement = null;
    
    // Check if we're inside a highlight span
    let node = commonAncestor;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.classList?.contains('highlight') || 
            element.style?.backgroundColor === 'rgb(255, 235, 59)' || 
            element.style?.backgroundColor === '#ffeb3b') {
          isHighlighted = true;
          highlightElement = element;
          break;
        }
      }
      node = node.parentNode;
    }
    
    if (isHighlighted && highlightElement) {
      // Remove highlight - unwrap the content
      const parent = highlightElement.parentNode;
      if (parent) {
        while (highlightElement.firstChild) {
          parent.insertBefore(highlightElement.firstChild, highlightElement);
        }
        parent.removeChild(highlightElement);
      }
    } else {
      // Add highlight
      const highlightSpan = document.createElement('span');
      highlightSpan.style.backgroundColor = '#ffeb3b';
      highlightSpan.style.padding = '2px 4px';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.className = 'highlight';
      
      try {
        range.surroundContents(highlightSpan);
      } catch (e) {
        // Fallback if surroundContents fails
        const contents = range.extractContents();
        highlightSpan.appendChild(contents);
        range.insertNode(highlightSpan);
      }
    }
    
    // Clear selection
    selection.removeAllRanges();
  };

  const insertSimpleList = (listType: 'ol' | 'ul') => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    let range: Range;
    if (selection.rangeCount === 0) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    } else {
      range = selection.getRangeAt(0);
    }

    // Check if we're already inside a list
    let currentNode = range.startContainer;
    let existingList = null;
    let existingListItem = null;

    // Walk up the DOM to find if we're inside a list
    while (currentNode && currentNode !== editor) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (element.tagName === 'LI') {
          existingListItem = element;
        }
        if (element.tagName === 'OL' || element.tagName === 'UL') {
          existingList = element;
          break;
        }
      }
      currentNode = currentNode.parentNode;
    }

    if (existingList) {
      // We're already inside a list
      if (existingList.tagName.toLowerCase() === listType) {
        // Same list type - add a new item or exit the list
        if (existingListItem && existingListItem.textContent?.trim() === '') {
          // Empty list item - exit the list
          const paragraph = document.createElement('p');
          paragraph.innerHTML = '<br>';
          existingList.parentNode?.insertBefore(paragraph, existingList.nextSibling);
          
          // Remove empty list item
          existingListItem.remove();
          
          // If list is now empty, remove it
          if (existingList.children.length === 0) {
            existingList.remove();
          }
          
          // Position cursor in the new paragraph
          const newRange = document.createRange();
          newRange.setStart(paragraph, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // Add new list item after current one
          const newListItem = document.createElement('li');
          newListItem.innerHTML = '<br>'; // Empty but focusable
          newListItem.style.display = 'list-item';
          newListItem.style.margin = '0.25rem 0';
          
          if (existingListItem) {
            existingListItem.parentNode?.insertBefore(newListItem, existingListItem.nextSibling);
          } else {
            existingList.appendChild(newListItem);
          }
          
          // Position cursor in the new empty list item
          const newRange = document.createRange();
          newRange.setStart(newListItem, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Different list type - convert the existing list
        const newList = document.createElement(listType);
        newList.style.paddingLeft = '1.5rem';
        newList.style.margin = '0.5rem 0';
        newList.style.listStylePosition = 'outside';
        newList.style.listStyleType = listType === 'ol' ? 'decimal' : 'disc';
        
        // Move all list items to the new list
        while (existingList.firstChild) {
          newList.appendChild(existingList.firstChild);
        }
        
        existingList.parentNode?.replaceChild(newList, existingList);
      }
    } else {
      // Not inside a list - create a new one
      const listElement = document.createElement(listType);
      listElement.style.paddingLeft = '1.5rem';
      listElement.style.margin = '0.5rem 0';
      listElement.style.listStylePosition = 'outside';
      listElement.style.listStyleType = listType === 'ol' ? 'decimal' : 'disc';
      
      if (range.collapsed) {
        // No selection - create a single empty list item at cursor
        const listItem = document.createElement('li');
        listItem.innerHTML = '<br>'; // Empty but focusable
        listItem.style.display = 'list-item';
        listItem.style.margin = '0.25rem 0';
        listElement.appendChild(listItem);
        
        range.insertNode(listElement);
        
        // Position cursor in the new empty list item
        const newRange = document.createRange();
        newRange.setStart(listItem, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Has selection - convert selected text to list (MS Word style)
        const selectedText = range.toString().trim();
        if (selectedText) {
          const lines = selectedText.split('\n').filter(line => line.trim());
          
          if (lines.length > 1) {
            // Multiple lines - create multiple list items
            lines.forEach(line => {
              const listItem = document.createElement('li');
              listItem.textContent = line.trim();
              listItem.style.display = 'list-item';
              listItem.style.margin = '0.25rem 0';
              listElement.appendChild(listItem);
            });
          } else {
            // Single line - convert it to a list item
            const listItem = document.createElement('li');
            listItem.textContent = selectedText;
            listItem.style.display = 'list-item';
            listItem.style.margin = '0.25rem 0';
            listElement.appendChild(listItem);
          }
          
          range.deleteContents();
          range.insertNode(listElement);
          
          // Position cursor at the end of the last list item
          const lastListItem = listElement.lastElementChild;
          if (lastListItem) {
            const newRange = document.createRange();
            newRange.selectNodeContents(lastListItem);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } else {
          // Empty selection - create empty list item
          const listItem = document.createElement('li');
          listItem.innerHTML = '<br>'; // Empty but focusable
          listItem.style.display = 'list-item';
          listItem.style.margin = '0.25rem 0';
          listElement.appendChild(listItem);
          
          range.insertNode(listElement);
          
          // Position cursor in the new empty list item
          const newRange = document.createRange();
          newRange.setStart(listItem, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  };


  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      setUndoStack(newUndoStack);
      setRedoStack(prev => [content, ...prev]);
      onContentChange(previousState);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = previousState;
      }
    }
  }, [undoStack, content, onContentChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      const newRedoStack = redoStack.slice(1);
      setRedoStack(newRedoStack);
      setUndoStack(prev => [...prev, content]);
      onContentChange(nextState);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = nextState;
      }
    }
  }, [redoStack, content, onContentChange]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = e.currentTarget;
    if (!editor) return;

    const newContent = editor.innerHTML;
    if (newContent !== content) {
      setUndoStack(prev => [...prev, content]);
      setRedoStack([]);
      onContentChange(newContent);
    }
  };

  // Clear formatting when content is empty
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = e.currentTarget;
    
    // Handle Enter key in lists
    if (e.key === 'Enter') {
      const currentSelection = window.getSelection();
      if (currentSelection && currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        let currentNode = range.startContainer;
        let listItem = null;
        let list = null;
        
        // Find if we're inside a list item
        while (currentNode && currentNode !== editor) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as Element;
            if (element.tagName === 'LI') {
              listItem = element;
            }
            if (element.tagName === 'OL' || element.tagName === 'UL') {
              list = element;
              break;
            }
          }
          currentNode = currentNode.parentNode;
        }
        
        if (listItem && list) {
          e.preventDefault();
          
          // Check if the current list item is empty
          if (!listItem.textContent?.trim()) {
            // Empty list item - exit the list
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            list.parentNode?.insertBefore(paragraph, list.nextSibling);
            
            // Remove empty list item
            listItem.remove();
            
            // If list is now empty, remove it
            if (list.children.length === 0) {
              list.remove();
            }
            
            // Position cursor in the new paragraph
            const newRange = document.createRange();
            newRange.setStart(paragraph, 0);
            newRange.collapse(true);
            currentSelection.removeAllRanges();
            currentSelection.addRange(newRange);
          } else {
            // Create new list item
            const newListItem = document.createElement('li');
            newListItem.innerHTML = '<br>'; // Empty but focusable
            newListItem.style.display = 'list-item';
            newListItem.style.margin = '0.25rem 0';
            
            listItem.parentNode?.insertBefore(newListItem, listItem.nextSibling);
            
            // Position cursor in the new list item
            const newRange = document.createRange();
            newRange.setStart(newListItem, 0);
            newRange.collapse(true);
            currentSelection.removeAllRanges();
            currentSelection.addRange(newRange);
          }
          return;
        }
      }
      
      // Default Enter behavior for non-list content
      e.preventDefault();
      const defaultSelection = window.getSelection();
      if (defaultSelection && defaultSelection.rangeCount > 0) {
        const range = defaultSelection.getRangeAt(0);
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        defaultSelection.removeAllRanges();
        defaultSelection.addRange(range);
      }
    }
    
    // Clear formatting when all content is deleted
    if ((e.key === 'Backspace' || e.key === 'Delete')) {
      setTimeout(() => {
        if (!editor.textContent?.trim()) {
          editor.innerHTML = '';
          // Reset all possible formatting
          editor.style.fontWeight = '';
          editor.style.fontStyle = '';
          editor.style.textDecoration = '';
          editor.style.backgroundColor = '';
        }
      }, 10);
    }
  };

  // Update editor content when prop changes
  React.useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className="space-y-2">
      <FormattingToolbar
        onFormatClick={handleFormat}
        onMediaUpload={handleMediaUpload}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="content-editor min-h-[120px] p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none overflow-auto"
          style={{ 
            minHeight: '120px',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'normal',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
          onFocus={(e) => {
            const target = e.currentTarget;
            if (target.textContent === placeholder || target.innerHTML.includes('pointer-events: none')) {
              target.innerHTML = '';
            }
          }}
          onBlur={(e) => {
            const target = e.currentTarget;
            if (!target.textContent?.trim()) {
              target.innerHTML = `<span style="color: #6b7280; pointer-events: none;">${placeholder}</span>`;
            }
          }}
        />
      </div>
      
      <MediaInputs
        fileInputRef={fileInputRef}
        onMediaChange={onMediaChange}
      />
      
      {renderMediaPreview()}
    </div>
  );
};

