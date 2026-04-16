import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl, getAuthHeaders } from '@/lib/slides-api';
import { toast } from 'sonner';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Download,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Trash2,
  Underline,
  Undo,
  Check,
  Link,
  Highlighter,
  ChevronDown,
  Loader2,
  X,
  Sparkles,
  RefreshCw,
  Pencil,
  Minimize2,
  Maximize2,
  CheckCheck,
  Languages,
} from 'lucide-react';

const AiNotesResult: React.FC = () => {
  const location = useLocation();
  const notes = location.state?.notes || '';
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [currentBlockStyle, setCurrentBlockStyle] = useState<'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote'>('p');
  const [currentTextColor, setCurrentTextColor] = useState<string>('default');
  const [currentHighlightColor, setCurrentHighlightColor] = useState<string>('transparent');
  const [contentHtml, setContentHtml] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const polishSelectionRef = useRef<Range | null>(null);
  const [isPolishMenuOpen, setIsPolishMenuOpen] = useState(false);
  const [isPolishLoading, setIsPolishLoading] = useState(false);
  const [hasEditorSelection, setHasEditorSelection] = useState(false);
  const [floatToolbar, setFloatToolbar] = useState<{ x: number; y: number } | null>(null);
  const floatToolbarRef = useRef<HTMLDivElement>(null);

  type PolishPanel = {
    label: string;
    action: string;
    option?: string;
    originalText: string;
    result: string;
    loading: boolean;
    showMore: boolean;
    resultCopied: boolean;
    resultEditing: boolean;
  };
  const [polishPanel, setPolishPanel] = useState<PolishPanel | null>(null);
  const panelPosRef = useRef<{ x: number; y: number } | null>(null);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const getActionLabel = (action: string, option?: string) => {
    const cap = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    if (action === 'shorten') return 'Shorten';
    if (action === 'extend') return 'Extend';
    if (action === 'rephrase') return 'Rephrase';
    if (action === 'fix_grammar') return 'Fix spelling & grammar';
    if (action === 'thesaurus') return 'Thesaurus';
    if (action === 'translate') return `Translate to ${cap(option)}`;
    if (action === 'tone') return `${cap(option)} tone`;
    if (action === 'writing_style') return `${cap(option)} style`;
    if (action === 'custom') return 'Ask AI';
    return cap(action);
  };

  const textColors = [
    '#172b4d', '#1d4ed8', '#0e7490', '#047857', '#d97706', '#c2410c', '#7e22ce',
    '#6b7280', '#3b82f6', '#0891b2', '#059669', '#eab308', '#dc2626', '#a855f7',
    '#ffffff', '#bfdbfe', '#bae6fd', '#a7f3d0', '#fef08a', '#fecaca', '#e9d5ff',
  ];

  const highlightColors = ['transparent', '#e5e7eb', '#e9d5ff', '#f5d0fe', '#fde68a', '#fef08a', '#d9f99d', '#bae6fd'];

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selectionRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRangeRef.current);
  }, []);

  const capturePolishSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return false;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;

    const withinEditor =
      editorRef.current.contains(range.startContainer) &&
      editorRef.current.contains(range.endContainer);

    if (!withinEditor) return false;

    polishSelectionRef.current = range.cloneRange();
    return true;
  }, []);

  const checkEditorSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      setHasEditorSelection(false);
      setFloatToolbar(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const withinEditor =
      editorRef.current.contains(range.startContainer) &&
      editorRef.current.contains(range.endContainer);
    const hasSelection = !range.collapsed && withinEditor;
    setHasEditorSelection(hasSelection);

    if (hasSelection) {
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      const toolbarWidth = 220;
      let x = rect.left + rect.width / 2 - toolbarWidth / 2 - editorRect.left;
      const minX = 0;
      const maxX = editorRect.width - toolbarWidth;
      x = Math.max(minX, Math.min(x, maxX));
      const y = rect.top - editorRect.top - 48;
      setFloatToolbar({ x, y });
    } else {
      setFloatToolbar(null);
    }
  }, []);

  const extractEditedText = (responseData: any): string => {
    if (!responseData) return '';

    const candidates = [
      responseData?.result?.edited_text,
      responseData?.result?.text,
      responseData?.result,
      responseData?.edited_text,
      responseData?.text,
      responseData?.output,
      responseData?.data?.edited_text,
      responseData?.data?.text,
      responseData?.data?.result,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    return '';
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handlePolishButtonClick = () => {
    const captured = capturePolishSelection();
    if (!captured) {
      setIsPolishMenuOpen(false);
      toast.error('Select text to apply AI Polish.');
      return;
    }
    setIsPolishMenuOpen(true);
  };

  const applyToPolishSelection = useCallback(async (action: string, option?: string) => {
    const range = polishSelectionRef.current;
    if (!range || !editorRef.current) {
      toast.error('Select text in the editor first.');
      return;
    }

    const selectedText = range.toString();
    if (!selectedText.trim()) {
      toast.error('Select text in the editor first.');
      return;
    }

    if (countWords(selectedText) > 500) {
      toast.error('Selected text exceeds 500 words. Please select a shorter passage.');
      return;
    }

    if ((action === 'translate' || action === 'tone' || action === 'writing_style') && !option) {
      toast.error('This AI Polish action requires an option.');
      return;
    }

    setIsPolishMenuOpen(false);
    setIsPolishLoading(true);
    const label = getActionLabel(action, option);
    setPanelPos(null);
    panelPosRef.current = null;
    setPolishPanel({ label, action, option, originalText: selectedText, result: '', loading: true, showMore: false, resultCopied: false, resultEditing: false });

    try {
      const response = await fetch(getApiUrl('/api/notes/ai-edit'), {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ text: selectedText, action, option }),
      });

      let data: any = null;
      try { data = await response.json(); } catch { data = null; }

      if (!response.ok || data?.success === false) {
        const errorMessage = data?.message || data?.error || `Failed to apply AI Polish (${response.status}).`;
        throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to apply AI Polish.');
      }

      const updatedText = extractEditedText(data);
      if (!updatedText.trim()) throw new Error('No edited text returned from AI Polish API.');

      setPolishPanel(prev => prev ? { ...prev, result: updatedText, loading: false } : null);
    } catch (error: any) {
      toast.error(error?.message || 'Could not apply AI Polish.');
      setPolishPanel(null);
    } finally {
      setIsPolishLoading(false);
    }
  }, []);

  const acceptPolish = useCallback(() => {
    if (!polishPanel?.result) return;
    const range = polishSelectionRef.current;
    if (!range) { setPolishPanel(null); return; }

    const selection = window.getSelection();
    if (selection) { selection.removeAllRanges(); selection.addRange(range); }
    const liveRange = selection?.rangeCount ? selection.getRangeAt(0) : range;
    liveRange.deleteContents();
    liveRange.insertNode(document.createTextNode(polishPanel.result));

    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
      setLastSavedAt(new Date());
    }
    setPolishPanel(null);
    polishSelectionRef.current = null;
  }, [polishPanel]);

  const rejectPolish = useCallback(() => {
    setPolishPanel(null);
  }, []);

  const copyPolishResult = useCallback(async () => {
    if (!polishPanel?.result) return;
    try {
      await navigator.clipboard.writeText(polishPanel.result);
      setPolishPanel(prev => prev ? { ...prev, resultCopied: true } : null);
      setTimeout(() => setPolishPanel(prev => prev ? { ...prev, resultCopied: false } : null), 1500);
    } catch { /* blocked */ }
  }, [polishPanel]);

  const regeneratePolish = useCallback(() => {
    if (!polishPanel) return;
    void applyToPolishSelection(polishPanel.action, polishPanel.option);
  }, [polishPanel, applyToPolishSelection]);

  const preserveSelectionOnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Convert backtick inline code: `code` → <code>code</code>
  const renderInlineCode = (text: string): string =>
    text.replace(/`([^`]+)`/g, '<code>$1</code>');

  const convertNotesToHtml = (json: any): string => {
    if (!json || !Array.isArray(json.sections)) return '<p>No notes found.</p>';

    let html = '';
    json.sections.forEach((section: any) => {
      html += `<h2>${section.title || 'Section'}</h2>`;

      if (!Array.isArray(section.children)) return;
      section.children.forEach((topic: any) => {
        html += `<h3>${topic.title || 'Topic'}</h3>`;
        if (!Array.isArray(topic.children)) return;

        let inList = false;
        topic.children.forEach((child: any) => {
          const content = child?.content || '';

          if (child.type === 'key_point') {
            if (!inList) {
              html += '<ul>';
              inList = true;
            }
            html += `<li>${renderInlineCode(content)}</li>`;
            return;
          }

          if (inList) {
            html += '</ul>';
            inList = false;
          }

          if (child.type === 'code' || child.type === 'code_block') {
            const lang = child.language || child.lang || '';
            const code = (child.code || content).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<pre data-language="${lang}"><code>${code}</code></pre>`;
          } else if (child.type === 'overview' || child.type === 'paragraph') {
            html += `<p>${renderInlineCode(content)}</p>`;
          } else if (child.type === 'heading') {
            html += `<h4>${renderInlineCode(content)}</h4>`;
          } else if (child.type === 'inference_block') {
            if (child.label) html += `<p><strong>${child.label}</strong></p>`;
            const rawCode = (child.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<pre data-language="${child.language || ''}"><code>${rawCode}</code></pre>`;
            if (Array.isArray(child.breakdown) && child.breakdown.length > 0) {
              html += '<ul>';
              child.breakdown.forEach((item: string) => {
                html += `<li>${renderInlineCode(item)}</li>`;
              });
              html += '</ul>';
            }
            if (child.why_matters) {
              html += `<p><em>${renderInlineCode(child.why_matters)}</em></p>`;
            }
          }
        });

        if (inList) {
          html += '</ul>';
        }
      });
    });

    return html;
  };

  const initialHtml = useMemo(() => {
    if (typeof notes === 'string') {
      return notes.trim() ? `<p>${notes}</p>` : '<p>No notes found.</p>';
    }
    return convertNotesToHtml(notes);
  }, [notes]);

  useEffect(() => {
    setContentHtml(initialHtml);
  }, [initialHtml]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== contentHtml) {
      editorRef.current.innerHTML = contentHtml;
    }
  }, [contentHtml]);

  const normalizeBlockStyle = useCallback((value?: string | null): 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' => {
    const cleaned = (value || '').toLowerCase().replace(/[<>]/g, '').trim();
    if (
      cleaned === 'p' ||
      cleaned === 'h1' ||
      cleaned === 'h2' ||
      cleaned === 'h3' ||
      cleaned === 'h4' ||
      cleaned === 'h5' ||
      cleaned === 'h6' ||
      cleaned === 'blockquote'
    ) {
      return cleaned;
    }
    return 'p';
  }, []);

  const detectCurrentBlockStyle = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    const node = selection.anchorNode;
    if (!node || !editorRef.current.contains(node)) return;

    selectionRangeRef.current = selection.getRangeAt(0).cloneRange();

    let element: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

    while (element && element !== editorRef.current) {
      const tag = element.tagName.toLowerCase();
      if (
        tag === 'p' ||
        tag === 'h1' ||
        tag === 'h2' ||
        tag === 'h3' ||
        tag === 'h4' ||
        tag === 'h5' ||
        tag === 'h6' ||
        tag === 'blockquote'
      ) {
        setCurrentBlockStyle(tag as 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote');
        return;
      }
      element = element.parentElement;
    }

    const commandValue = document.queryCommandValue('formatBlock');
    setCurrentBlockStyle(normalizeBlockStyle(commandValue));
  }, [normalizeBlockStyle]);

  useEffect(() => {
    const onSelectionChange = () => {
      detectCurrentBlockStyle();
      checkEditorSelection();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [detectCurrentBlockStyle, checkEditorSelection]);

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContentHtml(e.currentTarget.innerHTML);
    detectCurrentBlockStyle();
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      setLastSavedAt(new Date());
    }, 800);
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value || null);
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
    detectCurrentBlockStyle();
  };

  const getClosestEditableBlock = (node: Node | null): HTMLElement | null => {
    if (!node || !editorRef.current) return null;
    let element: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

    while (element && element !== editorRef.current) {
      const tag = element.tagName.toLowerCase();
      if (
        tag === 'p' ||
        tag === 'h1' ||
        tag === 'h2' ||
        tag === 'h3' ||
        tag === 'h4' ||
        tag === 'h5' ||
        tag === 'h6' ||
        tag === 'blockquote' ||
        tag === 'li' ||
        tag === 'div'
      ) {
        return element;
      }
      element = element.parentElement;
    }

    return null;
  };

  const getSelectedBlocks = (): HTMLElement[] => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return [];

    const range = selection.getRangeAt(0);
    const blocks: HTMLElement[] = [];

    if (range.collapsed) {
      const block = getClosestEditableBlock(selection.anchorNode);
      return block ? [block] : [];
    }

    const root = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;

    if (!root) return [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (!(node instanceof HTMLElement)) return NodeFilter.FILTER_SKIP;
        if (!editorRef.current?.contains(node)) return NodeFilter.FILTER_SKIP;
        const tag = node.tagName.toLowerCase();
        const isBlock =
          tag === 'p' ||
          tag === 'h1' ||
          tag === 'h2' ||
          tag === 'h3' ||
          tag === 'h4' ||
          tag === 'h5' ||
          tag === 'h6' ||
          tag === 'blockquote' ||
          tag === 'li' ||
          tag === 'div';

        if (!isBlock) return NodeFilter.FILTER_SKIP;

        try {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        } catch {
          return NodeFilter.FILTER_SKIP;
        }
      },
    });

    let current = walker.currentNode;
    while (current) {
      if (current instanceof HTMLElement) {
        blocks.push(current);
      }
      current = walker.nextNode();
    }

    if (blocks.length === 0) {
      const fallbackBlock = getClosestEditableBlock(selection.anchorNode);
      if (fallbackBlock) return [fallbackBlock];
    }

    return blocks;
  };

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    editorRef.current?.focus();
    restoreSelection();

    const command = align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight';
    document.execCommand(command, false);

    // Ensure alignment is applied even when execCommand behaves inconsistently.
    const selectedBlocks = getSelectedBlocks();
    selectedBlocks.forEach((block) => {
      block.style.textAlign = align;
    });

    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
    detectCurrentBlockStyle();
  };

  const applyTextColor = (color: string) => {
    if (color === 'default') {
      runCommand('removeFormat');
      setCurrentTextColor('default');
      return;
    }
    runCommand('foreColor', color);
    setCurrentTextColor(color);
  };

  const applyHighlightColor = (color: string) => {
    if (color === 'transparent') {
      runCommand('removeFormat');
      setCurrentHighlightColor('transparent');
      return;
    }
    runCommand('hiliteColor', color);
    setCurrentHighlightColor(color);
  };

  const removeTextAndHighlightColor = () => {
    runCommand('removeFormat');
    setCurrentTextColor('default');
    setCurrentHighlightColor('transparent');
  };

  const handleStyleChange = (value: string) => {
    const normalized = normalizeBlockStyle(value);
    setCurrentBlockStyle(normalized);
    if (value === 'p') {
      runCommand('formatBlock', 'p');
      return;
    }
    runCommand('formatBlock', value);
  };

  const clearContent = () => {
    setContentHtml('<p></p>');
    if (editorRef.current) editorRef.current.innerHTML = '<p></p>';
    setLastSavedAt(new Date());
  };

  const toPlainText = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    return doc.body.innerText || '';
  };

  const handleCopy = async () => {
    const text = toPlainText();
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard might be blocked by browser permissions.
    }
  };

  const handleDownload = () => {
    const htmlDocument = `<!doctype html><html><head><meta charset="utf-8" /><title>AI Notes</title></head><body>${contentHtml}</body></html>`;
    const blob = new Blob([htmlDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-notes.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-2 pt-1 pb-2">
            <div className="mx-auto flex w-fit items-center justify-center gap-1 rounded-2xl border bg-muted/40 px-2 py-2">
              <select
                className="h-8 min-w-[180px] rounded-md border bg-background px-2 text-sm"
                value={currentBlockStyle}
                onChange={(e) => handleStyleChange(e.target.value)}
              >
                <option value="p">Normal</option>
                <option value="h1">Title</option>
                <option value="h2">Heading 1</option>
                <option value="h3">Heading 2</option>
                <option value="h4">Heading 3</option>
                <option value="h5">Heading 4</option>
                <option value="h6">Heading 5</option>
                <option value="blockquote">Quote</option>
              </select>

              <div className="h-5 w-px bg-border mx-1" />

              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('bold')} title="Bold">
                <Bold className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('italic')} title="Italic">
                <Italic className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('underline')} title="Underline">
                <Underline className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('strikeThrough')} title="Strikethrough">
                <Strikethrough className="h-6 w-6" />
              </Button>

              <div className="h-5 w-px bg-border mx-1" />

              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => applyAlignment('left')} title="Align left">
                <AlignLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => applyAlignment('center')} title="Align center">
                <AlignCenter className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => applyAlignment('right')} title="Align right">
                <AlignRight className="h-6 w-6" />
              </Button>

              <div className="h-5 w-px bg-border mx-1" />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0" title="Text and highlight color">
                    <span className="text-sm font-semibold">A</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-[300px] p-3">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-semibold">Text colour</p>
                      <div className="grid grid-cols-7 gap-2">
                        <button
                          type="button"
                          className="h-7 w-7 rounded-md border bg-[#111827] text-white flex items-center justify-center"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyTextColor('default')}
                          title="Default text color"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        {textColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="h-7 w-7 rounded-md border"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyTextColor(color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold">Highlight colour</p>
                      <div className="grid grid-cols-8 gap-2">
                        {highlightColors.map((color, index) => (
                          <button
                            key={`${color}-${index}`}
                            type="button"
                            className="h-7 w-7 rounded-md border flex items-center justify-center text-xs font-semibold"
                            style={{ backgroundColor: color === 'transparent' ? '#f3f4f6' : color }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyHighlightColor(color)}
                            title={color === 'transparent' ? 'No highlight' : color}
                          >
                            A
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={removeTextAndHighlightColor}
                    >
                      Remove colour
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-5 w-px bg-border mx-1" />

              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('insertUnorderedList')} title="Bullet list">
                <List className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('insertOrderedList')} title="Numbered list">
                <ListOrdered className="h-6 w-6" />
              </Button>

              <div className="h-5 w-px bg-border mx-1" />

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 p-0 transition-opacity ${hasEditorSelection ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handlePolishButtonClick}
                  title={hasEditorSelection ? 'AI Polish' : 'Select text to use AI Polish'}
                >
                  <img src="/icons/bot.svg" alt="AI Polish" className="h-6 w-6" />
                </Button>
              <DropdownMenu
                open={isPolishMenuOpen}
                onOpenChange={(open) => {
                  if (!open) setIsPolishMenuOpen(false);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <span className="absolute inset-0 pointer-events-none" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('shorten')}>Shorten</DropdownMenuItem>
                  <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('extend')}>Extend</DropdownMenuItem>
                  <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('rephrase')}>Rephrase</DropdownMenuItem>
                  <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('fix_grammar')}>Spelling and Grammar</DropdownMenuItem>
                  <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('thesaurus')}>Thesaurus</DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Translate</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('translate', 'english')}>English</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('translate', 'hindi')}>Hindi</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('translate', 'spanish')}>Spanish</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('translate', 'french')}>French</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Tone of Voice</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('tone', 'professional')}>Professional</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('tone', 'friendly')}>Friendly</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('tone', 'confident')}>Confident</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('tone', 'neutral')}>Neutral</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Writing Style</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('writing_style', 'academic')}>Academic</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('writing_style', 'journalistic')}>Journalistic</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('writing_style', 'conversational')}>Conversational</DropdownMenuItem>
                      <DropdownMenuItem disabled={isPolishLoading} onSelect={() => void applyToPolishSelection('writing_style', 'creative')}>Creative</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('undo')} title="Undo">
                <Undo className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={() => runCommand('redo')} title="Redo">
                <Redo className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={handleCopy} title="Copy">
                <Copy className={`h-6 w-6 ${copied ? 'text-emerald-600' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={handleDownload} title="Download">
                <Download className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onMouseDown={preserveSelectionOnMouseDown} onClick={clearContent} title="Clear all">
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
            <p className="mt-2 text-center text-sm font-medium text-[#2f4a7a]">
              Last saved at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

          </div>

          <div className="max-h-[78vh] overflow-auto">
            <div className="relative">
            {floatToolbar && (
              <div
                ref={floatToolbarRef}
                className="absolute z-20 flex items-center gap-0.5 rounded-full border bg-white shadow-lg px-2 py-1.5 pointer-events-auto"
                style={{ left: floatToolbar.x, top: floatToolbar.y }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* AI brand icon */}
                <div className="flex h-7 w-7 items-center justify-center text-violet-600 flex-shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="h-4 w-px bg-border mx-1" />

                {/* Shorten */}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  onClick={() => {
                    const captured = capturePolishSelection();
                    if (captured) { setFloatToolbar(null); void applyToPolishSelection('shorten'); }
                  }}
                  title="Shorten"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>

                {/* Extend */}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  onClick={() => {
                    const captured = capturePolishSelection();
                    if (captured) { setFloatToolbar(null); void applyToPolishSelection('extend'); }
                  }}
                  title="Extend"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>

                {/* Rephrase */}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  onClick={() => {
                    const captured = capturePolishSelection();
                    if (captured) { setFloatToolbar(null); void applyToPolishSelection('rephrase'); }
                  }}
                  title="Rephrase"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>

                {/* Spelling & Grammar */}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  onClick={() => {
                    const captured = capturePolishSelection();
                    if (captured) { setFloatToolbar(null); void applyToPolishSelection('fix_grammar'); }
                  }}
                  title="Spelling & Grammar"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-border mx-1" />

                {/* More dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
                      onClick={() => capturePolishSelection()}
                      title="More options"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="z-[60]">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><Languages className="h-4 w-4 mr-2" />Translate</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('translate', 'english'); }}>English</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('translate', 'hindi'); }}>Hindi</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('translate', 'spanish'); }}>Spanish</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('translate', 'french'); }}>French</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Tone</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('tone', 'professional'); }}>Professional</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('tone', 'friendly'); }}>Friendly</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('tone', 'confident'); }}>Confident</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('tone', 'neutral'); }}>Neutral</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Writing Style</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('writing_style', 'academic'); }}>Academic</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('writing_style', 'creative'); }}>Creative</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('writing_style', 'business'); }}>Business</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('writing_style', 'casual'); }}>Casual</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onSelect={() => { setFloatToolbar(null); void applyToPolishSelection('thesaurus'); }}>Thesaurus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Dismiss */}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                  onClick={() => setFloatToolbar(null)}
                  title="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {isPolishLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg pointer-events-none">
                <div className="flex items-center gap-2 bg-background border border-border shadow-lg rounded-full px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  <span className="text-sm font-medium text-foreground">AI is generating…</span>
                </div>
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="max-w-none min-h-[520px] px-2 pb-6 md:px-2 focus:outline-none text-[15px] leading-7 text-[#172b4d] [&_p]:my-2 [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-[2rem] [&_h1]:leading-[1.2] [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-[1.625rem] [&_h2]:leading-[1.25] [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[1.25rem] [&_h3]:leading-[1.3] [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-[1.05rem] [&_h4]:leading-[1.35] [&_h4]:font-semibold [&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:text-[0.92rem] [&_h5]:leading-[1.4] [&_h5]:font-semibold [&_h6]:mt-3 [&_h6]:mb-2 [&_h6]:text-[0.8rem] [&_h6]:leading-[1.45] [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-[0.04em] [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#dfe1e6] [&_blockquote]:pl-4 [&_blockquote]:text-[#42526e] [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:bg-[#1e1e2e] [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre_code]:font-mono [&_pre_code]:text-[#cdd6f4] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[#f0f0f5] [&_code]:text-[#c7254e] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:text-[#cdd6f4]"
              suppressContentEditableWarning
            />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Polish panel — centered, draggable */}
      {polishPanel && (
        <div
          className="fixed z-50 flex flex-col bg-background rounded-xl shadow-2xl overflow-hidden select-none ring-1 ring-border/60"
          style={{
            width: 720,
            height: 480,
            ...(panelPos
              ? { left: panelPos.x, top: panelPos.y, transform: 'none' }
              : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }),
          }}
          onMouseMove={(e) => {
            if (!draggingRef.current) return;
            const nx = e.clientX - dragOffsetRef.current.x;
            const ny = e.clientY - dragOffsetRef.current.y;
            panelPosRef.current = { x: nx, y: ny };
            setPanelPos({ x: nx, y: ny });
          }}
          onMouseUp={() => { draggingRef.current = false; }}
          onMouseLeave={() => { draggingRef.current = false; }}
        >
          {/* Header — drag handle */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-border cursor-grab active:cursor-grabbing flex-shrink-0"
            onMouseDown={(e) => {
              draggingRef.current = true;
              const rect = (e.currentTarget.closest('[style]') as HTMLElement)?.getBoundingClientRect();
              if (rect) {
                dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
              }
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-violet-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground">AI Polish</span>
            </div>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={rejectPolish}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable chat area */}
          <div className="ai-polish-scroll flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 min-h-0">

            {/* User bubble — action label */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
                {polishPanel.label}
              </div>
            </div>

            {/* Original text bubble */}
            {polishPanel.originalText && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted/50 border border-border/50 px-4 py-3 text-sm text-foreground/70 leading-relaxed">
                  {polishPanel.showMore
                    ? polishPanel.originalText
                    : polishPanel.originalText.length > 200
                      ? polishPanel.originalText.slice(0, 200) + '…'
                      : polishPanel.originalText}
                  {polishPanel.originalText.length > 200 && (
                    <button
                      className="block mt-1.5 text-xs text-violet-600 hover:underline"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setPolishPanel(prev => prev ? { ...prev, showMore: !prev.showMore } : null)}
                    >
                      {polishPanel.showMore ? 'Show less' : '↓ Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* AI bot response */}
            <div className="flex items-start gap-3">
              <img src="/icons/bot.svg" alt="AI" className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-70" />
              <div className="flex-1 flex flex-col gap-3">
                {/* Result bubble — editable when in edit mode */}
                {polishPanel.resultEditing ? (
                  <textarea
                    className="w-full rounded-2xl rounded-tl-sm border border-violet-300 bg-background px-4 py-3 text-sm text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                    rows={6}
                    value={polishPanel.result}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => setPolishPanel(prev => prev ? { ...prev, result: e.target.value } : null)}
                  />
                ) : (
                  <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-background px-4 py-3 text-sm text-foreground leading-relaxed">
                    {polishPanel.loading ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating…</span>
                      </span>
                    ) : (
                      polishPanel.result || <span className="text-muted-foreground italic">Waiting…</span>
                    )}
                  </div>
                )}

                {/* Action buttons row */}
                {!polishPanel.loading && polishPanel.result && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Replace */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={acceptPolish}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v10M4 9l4 4 4-4" />
                      </svg>
                      Replace
                    </button>

                    {/* Icon separator */}
                    <div className="h-4 w-px bg-border mx-0.5" />

                    {/* Copy result */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => void copyPolishResult()}
                      title={polishPanel.resultCopied ? 'Copied!' : 'Copy result'}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
                    >
                      {polishPanel.resultCopied
                        ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                        : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </button>

                    {/* Regenerate */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={regeneratePolish}
                      title="Regenerate"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    {/* Edit inline */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setPolishPanel(prev => prev ? { ...prev, resultEditing: !prev.resultEditing } : null)}
                      title={polishPanel.resultEditing ? 'Done editing' : 'Edit result'}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border bg-background transition-colors shadow-sm ${polishPanel.resultEditing ? 'border-violet-400 text-violet-600' : 'border-border hover:bg-muted text-muted-foreground'}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Discard — text link style */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={rejectPolish}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiNotesResult;
