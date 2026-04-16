
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, Italic, List, ListOrdered, Image, 
  Link, Code, Table, Quote, Heading1, Heading2, Heading3, 
  Minus, AlignLeft, Calculator, Smile
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  execCommand: (command: string, value?: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  execCommand
}) => {
  const handleInsert = (element: string) => {
    switch(element) {
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          execCommand('createLink', url);
        }
        break;
      case 'image':
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) {
          execCommand('insertImage', imgUrl);
        }
        break;
      case 'heading1':
        execCommand('formatBlock', '<h1>');
        break;
      case 'heading2':
        execCommand('formatBlock', '<h2>');
        break;
      case 'heading3':
        execCommand('formatBlock', '<h3>');
        break;
      case 'blockquote':
        execCommand('formatBlock', '<blockquote>');
        break;
      case 'code-block':
        execCommand('formatBlock', '<pre>');
        execCommand('formatBlock', '<code>');
        break;
      case 'table':
        const html = '<table class="border-collapse border border-slate-400 w-full my-4"><thead><tr><th class="border border-slate-300 p-2">Header 1</th><th class="border border-slate-300 p-2">Header 2</th></tr></thead><tbody><tr><td class="border border-slate-300 p-2">Cell 1</td><td class="border border-slate-300 p-2">Cell 2</td></tr><tr><td class="border border-slate-300 p-2">Cell 3</td><td class="border border-slate-300 p-2">Cell 4</td></tr></tbody></table>';
        execCommand('insertHTML', html);
        break;
      case 'horizontal-rule':
        execCommand('insertHorizontalRule');
        break;
      case 'emoji':
        execCommand('insertText', '😊');
        break;
      case 'footnote':
        execCommand('insertHTML', '<sup>[1]</sup>');
        execCommand('insertHTML', '<p class="footnote">[1] Footnote text here</p>');
        break;
      case 'definition-list':
        const definitionList = '<dl class="my-4"><dt class="font-bold">Term</dt><dd class="ml-4 mb-2">Definition</dd><dt class="font-bold">Another term</dt><dd class="ml-4 mb-2">Another definition</dd></dl>';
        execCommand('insertHTML', definitionList);
        break;
      case 'math':
        execCommand('insertHTML', '<span class="math-formula">E = mc<sup>2</sup></span>');
        break;
      default:
        break;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => execCommand('bold')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Bold className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => execCommand('italic')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Italic className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
                  <Heading2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Headings</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleInsert('heading1')}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleInsert('heading2')}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleInsert('heading3')}>
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => execCommand('insertUnorderedList')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><List className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => execCommand('insertOrderedList')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><ListOrdered className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('link')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Link className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('image')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Image className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('code-block')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Code className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('table')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Table className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Table</TooltipContent>
          </Tooltip>
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('blockquote')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Quote className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Blockquote</TooltipContent>
          </Tooltip>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-md"
          onClick={() => handleInsert('horizontal-rule')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Minus className="h-4 w-4" /></span>
            </TooltipTrigger>
            <TooltipContent>Horizontal Rule</TooltipContent>
          </Tooltip>
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Advanced</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleInsert('emoji')}>
              <Smile className="h-4 w-4 mr-2" /> Emoji
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleInsert('footnote')}>
              <span className="mr-2 text-xs font-bold">[1]</span> Footnote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleInsert('definition-list')}>
              <span className="mr-2 text-xs font-bold">DL</span> Definition List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleInsert('math')}>
              <Calculator className="h-4 w-4 mr-2" /> Math Formula
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};
