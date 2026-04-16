
import React, { useEffect } from 'react';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  setContent: (content: string) => void;
  onSelectionChange?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  viewMode: 'edit' | 'preview' | 'split';
  markdownEditorRef?: React.RefObject<HTMLTextAreaElement>;
  onMarkdownChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  content,
  setContent,
  onSelectionChange,
  onKeyDown,
  viewMode,
  markdownEditorRef,
  onMarkdownChange
}) => {
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const divContent = e.currentTarget.innerHTML;
    setContent(divContent);
  };

  // Stop event propagation to prevent unwanted focus changes
  const handleEditorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (viewMode === 'edit') {
    return (
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleInput}
        onSelect={onSelectionChange}
        onKeyDown={onKeyDown}
        onClick={handleEditorClick}
        className="flex-1 outline-none prose prose-sm max-w-none p-2 overflow-auto min-h-[300px]"
      />
    );
  } else if (viewMode === 'preview') {
    return (
      <div className="flex-1 p-4 overflow-auto prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  } else if (viewMode === 'split') {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 h-full p-4 overflow-auto border-r">
          {markdownEditorRef && onMarkdownChange ? (
            <textarea
              ref={markdownEditorRef}
              value={content}
              onChange={onMarkdownChange}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full p-2 font-mono text-sm resize-none border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <div>Markdown editor not available</div>
          )}
        </div>
        <div className="w-1/2 h-full p-4 overflow-auto prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div
      ref={editorRef}
      contentEditable
      dangerouslySetInnerHTML={{ __html: content }}
      onInput={handleInput}
      onSelect={onSelectionChange}
      onKeyDown={onKeyDown}
      onClick={handleEditorClick}
      className="flex-1 outline-none prose prose-sm max-w-none p-2 overflow-auto min-h-[300px]"
    />
  );
};
