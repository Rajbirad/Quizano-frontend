import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Copy, Check, ChevronDown, ChevronUp, Trash2, RotateCcw, Share, Maximize2, Minimize2, Globe, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { useToast } from '@/hooks/use-toast';
import DirectUploadService from '@/components/ai-chat-files/services/DirectUploadService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Pane-count selector icons ─────────────────────────────────────────────────

const PaneIcon1 = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const PaneIcon2 = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <rect x="2" y="2" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="2" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const PaneIcon3 = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <rect x="1" y="2" width="5" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="7.5" y="2" width="5" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="2" width="5" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const PaneIcon4 = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <rect x="1" y="2" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="6" y="2" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="2" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="16" y="2" width="3" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const PaneIcon6 = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    {/* top row */}
    <rect x="1" y="1" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="7.5" y="1" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="14" y="1" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    {/* bottom row */}
    <rect x="1" y="11" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="7.5" y="11" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="14" y="11" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

interface PaneSelectorProps {
  paneCount: number;
  setPaneCount: (n: number) => void;
}

const PaneSelector = ({ paneCount, setPaneCount }: PaneSelectorProps) => (
  <div className="flex items-center gap-0.5 bg-muted/60 rounded-xl p-1 border border-border/50">
    {([1, 2, 3, 4, 6] as const).map((n) => {
      const Icon = n === 1 ? PaneIcon1 : n === 2 ? PaneIcon2 : n === 3 ? PaneIcon3 : n === 4 ? PaneIcon4 : PaneIcon6;
      return (
        <button
          key={n}
          onClick={() => setPaneCount(n)}
          title={`${n} pane${n > 1 ? 's' : ''}`}
          className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all ${
            paneCount === n
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Icon />
        </button>
      );
    })}
  </div>
);

// ── Model definitions ──────────────────────────────────────────────────────────

const OpenAIIcon = () => (
  <img src="/icons/chatgpt.svg" alt="ChatGPT" className="w-6 h-6" />
);

const AnthropicIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    {/* 10-spike sunburst — outer r=45, inner r=15, centered 50,50 */}
    <polygon fill="#E8622A" points="
      50,5 54.6,35.7 76.5,13.6 62.1,41.2 92.8,36.1
      65,50 92.8,63.9 62.1,58.8 76.5,86.4 54.6,64.3
      50,95 45.4,64.3 23.5,86.4 37.9,58.8 7.2,63.9
      35,50 7.2,36.1 37.9,41.2 23.5,13.6 45.4,35.7
    "/>
  </svg>
);

const XAIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <rect width="24" height="24" rx="5" fill="#000"/>
    <path d="M6 6l5.25 6.5L6 18h2l4.13-4.96L15.5 18H18l-5.5-6.82L17.75 6H15.8l-3.8 4.56L8.5 6H6z" fill="white"/>
  </svg>
);

const DeepSeekIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <rect width="100" height="100" rx="16" fill="#1C6BFF"/>
    <path d="M78.5 34.8c-1.6-2.8-4.2-4.7-7.2-5.3-4.5-.9-8.6 1.2-10.9 5.1a12 12 0 0 0-1.5 5.9c0 1.4.2 2.8.7 4.1-3.2-1.4-5.6-4.2-6.2-7.8-.8-4.8 1.8-9.6 6.3-11.6 5.2-2.3 11.3-.2 14 4.8.3.6.6 1.2.8 1.8M38 65.8c1.2 2.1 3.2 3.6 5.6 4.1 3.4.7 6.7-.9 8.4-4a9.3 9.3 0 0 0 1.1-4.6c0-1.1-.2-2.2-.6-3.2 2.5 1.1 4.4 3.3 4.9 6 .6 3.8-1.4 7.5-4.9 9-4 1.8-8.8.2-10.9-3.7-.3-.5-.5-.9-.6-1.4M59.8 47.6c-1 3-3.3 5.4-6.3 6.5-4.3 1.6-9.1-.1-11.6-3.9a11.9 11.9 0 0 1-1.8-6c0-2 .5-3.9 1.4-5.6.2 5.5 4.7 9.9 10.2 9.9a10.1 10.1 0 0 0 8.1-4V47.6z" fill="white"/>
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="url(#gemini_grad)"/>
    <defs>
      <linearGradient id="gemini_grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const MetaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M12 10.8c.9-1.4 2.2-3 3.5-3 2.4 0 3.8 2.8 3.8 6.2 0 1.9-.5 3.2-1.3 3.2-.7 0-1.1-.7-1.6-2.2L15 12.5c-.4-1.2-.8-2-1-2.5V14c0 2.4-.9 4-2 4s-2-1.6-2-4V10c-.2.5-.6 1.3-1 2.5l-1.4 2.5C7.1 16.5 6.7 17.2 6 17.2c-.8 0-1.3-1.3-1.3-3.2 0-3.4 1.4-6.2 3.8-6.2 1.3 0 2.6 1.6 3.5 3z" fill="url(#meta_grad)"/>
    <defs>
      <linearGradient id="meta_grad" x1="5" y1="8" x2="19" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0064E0"/>
        <stop offset="1" stopColor="#00C8FF"/>
      </linearGradient>
    </defs>
  </svg>
);

const MistralIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <rect width="24" height="24" rx="4" fill="#fff"/>
    <rect x="3" y="3" width="5" height="5" fill="#000"/>
    <rect x="10" y="3" width="4" height="5" fill="#F7531F"/>
    <rect x="16" y="3" width="5" height="5" fill="#000"/>
    <rect x="3" y="10" width="5" height="4" fill="#F7531F"/>
    <rect x="16" y="10" width="5" height="4" fill="#F7531F"/>
    <rect x="3" y="16" width="5" height="5" fill="#000"/>
    <rect x="10" y="16" width="4" height="5" fill="#F7531F"/>
    <rect x="16" y="16" width="5" height="5" fill="#000"/>
  </svg>
);

const PerplexityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <rect width="24" height="24" rx="5" fill="#1C1C1C"/>
    <path d="M12 4L7 8.5V11h2V9.2l3-2.7 3 2.7V11h2V8.5L12 4z" fill="#20DDAA"/>
    <path d="M9 11h6v2H9zM7 13h2v7H7zM15 13h2v7h-2zM9 18h6v2H9z" fill="#20DDAA"/>
  </svg>
);

interface ModelDef {
  id: string;
  name: string;
  description: string;
  icon: 'openai' | 'anthropic' | 'gemini' | 'xai' | 'deepseek' | 'meta' | 'mistral' | 'perplexity';
  provider: string;
}

const MODELS: ModelDef[] = [
  { id: 'gpt-5.4',                   name: 'GPT-5.4',                   icon: 'openai',    provider: 'OpenAI',    description: 'Most capable OpenAI model with advanced reasoning and multimodal skills.' },
  { id: 'gpt-5.4-thinking',          name: 'GPT-5.4 Thinking',          icon: 'openai',    provider: 'OpenAI',    description: 'Extended thinking variant of GPT-5.4 for complex multi-step reasoning.' },
  { id: 'gpt-5-mini',                name: 'GPT-5 mini',                icon: 'openai',    provider: 'OpenAI',    description: 'Fast and cost-efficient GPT-5 model for everyday tasks.' },
  { id: 'gpt-5.4-nano',              name: 'GPT-5.4 Nano',              icon: 'openai',    provider: 'OpenAI',    description: 'Ultra-light GPT-5.4 variant optimised for speed and low-latency responses.' },
  { id: 'claude-sonnet-4.6',         name: 'Claude Sonnet 4.6',         icon: 'anthropic', provider: 'Anthropic', description: 'Balanced intelligence and speed — great for complex tasks and writing.' },
  { id: 'claude-sonnet-4.6-thinking',name: 'Claude Sonnet 4.6 Thinking',icon: 'anthropic', provider: 'Anthropic', description: 'Extended thinking variant of Sonnet 4.6 for deeper reasoning.' },
  { id: 'claude-opus-4.6',           name: 'Claude Opus 4.6',           icon: 'anthropic', provider: 'Anthropic', description: 'Most powerful Claude model — best for highly complex tasks.' },
  { id: 'claude-haiku-4.5',          name: 'Claude Haiku 4.5',          icon: 'anthropic', provider: 'Anthropic', description: 'Fastest and most compact Claude model for near-instant responses.' },
  { id: 'gemini-3.1-pro',            name: 'Gemini 3.1 Pro',            icon: 'gemini',    provider: 'Google',    description: 'Google\'s most capable model with deep reasoning and multimodal understanding.' },
  { id: 'gemini-3-flash',            name: 'Gemini 3 Flash',            icon: 'gemini',    provider: 'Google',    description: 'Fast, smart and efficient — handles text, images, audio and video.' },
  { id: 'gemini-2.5-pro',            name: 'Gemini 2.5 Pro',            icon: 'gemini',    provider: 'Google',    description: 'Balanced Google model with strong reasoning and multimodal skills.' },
  { id: 'gemini-2.5-flash',          name: 'Gemini 2.5 Flash',          icon: 'gemini',    provider: 'Google',    description: 'Speed-optimised Gemini 2.5 model for high-volume tasks.' },
  { id: 'grok-4.1',                  name: 'Grok 4.1',                  icon: 'xai',       provider: 'xAI',       description: 'xAI\'s latest model with real-time knowledge and sharp reasoning.' },
  { id: 'deepseek-v3.2',             name: 'DeepSeek V3.2',             icon: 'deepseek',    provider: 'DeepSeek',   description: 'Faster for long-text work while keeping output quality high.' },
  { id: 'deepseek-r1',               name: 'DeepSeek R1',               icon: 'deepseek',    provider: 'DeepSeek',   description: 'Strong in deep thinking, coding and reasoning — good for harder tasks.' },
  { id: 'llama-4',                   name: 'Llama 4',                   icon: 'meta',        provider: 'Meta',       description: 'Meta\'s latest open model with strong reasoning and multimodal capabilities.' },
  { id: 'mistral-large-3',           name: 'Mistral Large 3',           icon: 'mistral',     provider: 'Mistral AI', description: 'Mistral\'s most powerful model for complex tasks and multilingual use.' },
  { id: 'mistral-medium-3.1',        name: 'Mistral Medium 3.1',        icon: 'mistral',     provider: 'Mistral AI', description: 'Balanced speed and intelligence for everyday tasks.' },
  { id: 'perplexity-sonar',          name: 'Perplexity Sonar',          icon: 'perplexity',  provider: 'Perplexity', description: 'Real-time web-grounded AI with cited, up-to-date answers.' },
];

const ModelIcon = ({ icon }: { icon: ModelDef['icon'] }) => {
  if (icon === 'openai')     return <OpenAIIcon />;
  if (icon === 'anthropic')  return <AnthropicIcon />;
  if (icon === 'xai')        return <XAIIcon />;
  if (icon === 'deepseek')   return <DeepSeekIcon />;
  if (icon === 'meta')       return <MetaIcon />;
  if (icon === 'mistral')    return <MistralIcon />;
  if (icon === 'perplexity') return <PerplexityIcon />;
  return <GeminiIcon />;
};

// ── Stream helper ──────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationRow {
  id: string;
  title: string;
  model?: string;
  updated_at: string;
}

// POST /api/chat — streams SSE tokens back
async function streamChat(
  conversationId: string | null,
  message: string,
  model: string,
  token: string,
  onConversationId: (id: string) => void,
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: string) => void,
  signal: AbortSignal,
  documentId?: string | null,
  webSearch?: boolean,
) {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...(conversationId ? { conversation_id: conversationId } : {}),
        ...(documentId ? { document_id: documentId } : {}),
        ...(webSearch ? { web_search: true } : {}),
        message,
        model,
      }),
      signal,
    });
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return;
    onError('Failed to connect to the server. Please try again.');
    return;
  }

  if (!res.ok) { onError(`Server error: ${res.status} ${res.statusText}`); return; }

  const reader = res.body?.getReader();
  if (!reader) { onError('No response body from server.'); return; }
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const payload = JSON.parse(raw);
          if (payload.conversation_id) onConversationId(payload.conversation_id);
          if (payload.token) onToken(payload.token);
          if (payload.done)  onDone();
          if (payload.error) onError(payload.error);
        } catch { /* skip non-JSON */ }
      }
    }
  } catch (err: unknown) {
    if ((err as Error).name !== 'AbortError') onError('Stream interrupted unexpectedly.');
  } finally {
    reader.releaseLock();
  }
}

// POST /api/chat/multi-model — streams SSE events with panel_id routing
async function streamChatMultiModel(
  message: string,
  models: Array<{ model_id: string; panel_id: number }>,
  token: string,
  onToken: (panelId: number, t: string) => void,
  onDone: (panelId: number) => void,
  onError: (panelId: number, err: string) => void,
  signal: AbortSignal,
) {
  let res: Response;
  try {
    res = await fetch('/api/chat/multi-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        models,
      }),
      signal,
    });
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return;
    models.forEach(m => onError(m.panel_id, 'Failed to connect to the server.'));
    return;
  }
  if (!res.ok) {
    models.forEach(m => onError(m.panel_id, `Server error: ${res.status} ${res.statusText}`));
    return;
  }
  const reader = res.body?.getReader();
  if (!reader) { models.forEach(m => onError(m.panel_id, 'No response body.')); return; }
  const decoder = new TextDecoder();
  const doneSet = new Set<number>();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const payload = JSON.parse(raw);
          const pid: number = payload.panel_id ?? 0;
          if (payload.token) onToken(pid, payload.token);
          if (payload.done)  { onDone(pid); doneSet.add(pid); }
          if (payload.error) onError(pid, payload.error);
        } catch { /* skip non-JSON */ }
      }
    }
    models.forEach(m => { if (!doneSet.has(m.panel_id)) onDone(m.panel_id); });
  } catch (err: unknown) {
    if ((err as Error).name !== 'AbortError')
      models.forEach(m => { if (!doneSet.has(m.panel_id)) onError(m.panel_id, 'Stream interrupted unexpectedly.'); });
  } finally {
    reader.releaseLock();
  }
}

// ── Sub-components (defined outside AiChatPage to prevent remount on re-render) ─

interface ModelPickerProps {
  selectedModel: ModelDef;
  setSelectedModel: (m: ModelDef) => void;
}

const ModelPicker = ({ selectedModel, setSelectedModel }: ModelPickerProps) => {
  const grouped = MODELS.reduce<Record<string, ModelDef[]>>((acc, m) => {
    (acc[m.provider] = acc[m.provider] || []).push(m);
    return acc;
  }, {});
  const providers = Object.keys(grouped);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-colors focus:outline-none">
          <ModelIcon icon={selectedModel.icon} />
          <span>{selectedModel.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-1 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{scrollbarWidth:'thin',scrollbarColor:'#d1d5db transparent'}}>
        {providers.map((provider, pi) => (
          <div key={provider}>
            {pi > 0 && <div className="my-1 border-t border-border/40" />}
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground tracking-wide">{provider}</p>
            {grouped[provider].map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => setSelectedModel(m)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
              >
                <div className="flex-shrink-0"><ModelIcon icon={m.icon} /></div>
                <span className={`flex-1 text-sm font-medium ${
                  m.icon === 'openai' ? 'text-foreground' :
                  m.icon === 'anthropic' ? 'text-orange-700' :
                  m.icon === 'xai' ? 'text-foreground' :
                  m.icon === 'deepseek' ? 'text-blue-600' :
                  m.icon === 'meta' ? 'text-blue-500' :
                  m.icon === 'mistral' ? 'text-orange-500' :
                  m.icon === 'perplexity' ? 'text-teal-600' :
                  'text-blue-500'
                }`}>{m.name}</span>
                {selectedModel.id === m.id && <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface InputBoxProps {
  compact?: boolean;
  input: string;
  setInput: (v: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isStreaming: boolean;
  sendMessage: () => void;
  stopStreaming: () => void;
  selectedModel: ModelDef;
  setSelectedModel: (m: ModelDef) => void;
  onDocumentReady?: (documentId: string, fileName: string) => void;
  onWebSearchChange?: (enabled: boolean) => void;
}

const InputBox = ({
  compact = false, input, setInput, handleKeyDown,
  isStreaming, sendMessage, stopStreaming, selectedModel, setSelectedModel,
  onDocumentReady, onWebSearchChange,
}: InputBoxProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const [webSearch, setWebSearch] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAttachedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadService = new DirectUploadService();
      const result = await uploadService.uploadFile(file, (p) => setUploadProgress(p));
      if (!result.success || !result.document_id) throw new Error(result.message || 'Upload failed');
      onDocumentReady?.(result.document_id, file.name);
      toast({ title: 'File ready', description: `${file.name} processed. Ask your question below.` });
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
      setAttachedFile(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const baseRows = compact ? 3 : 5;
  const rows = expanded ? 12 : baseRows;
  return (
    <div className={`border rounded-2xl bg-background shadow-sm focus-within:border-purple-400 transition-all ${compact ? '' : 'border-border'}`}>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything…"
        disabled={isStreaming}
        rows={rows}
        className="resize-none border-0 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-4 pt-4 pb-0 transition-all duration-200"
        autoFocus
      />
      {attachedFile && (
        <div className="mx-4 mb-1 mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground w-fit max-w-[260px]">
          {isUploading
            ? <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
            : <Paperclip className="h-3 w-3 flex-shrink-0" />}
          <span className="truncate">{attachedFile.name}</span>
          {isUploading
            ? <span className="flex-shrink-0 text-purple-500 tabular-nums">{uploadProgress}%</span>
            : <button
                onClick={() => { setAttachedFile(null); onDocumentReady?.('', ''); }}
                className="ml-0.5 hover:text-destructive transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
          }
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center justify-between px-3 pb-3 pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { const next = !webSearch; setWebSearch(next); onWebSearchChange?.(next); }}
            title={webSearch ? 'Web search on' : 'Web search off'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              webSearch
                ? 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700'
                : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Web search</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              attachedFile
                ? 'bg-purple-50 text-purple-600 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-700'
                : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            <span>Attach</span>
          </button>
          <div className="w-px h-4 bg-border/60 mx-1" />
          <ModelPicker selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          {isStreaming ? (
            <Button size="sm" variant="outline" onClick={stopStreaming} className="gap-1.5 h-8">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={sendMessage} disabled={!input.trim()} className="gap-1.5 h-8">
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── ChatPane — multi-pane panel with top model header ─────────────────────────

interface ChatPaneHandle {
  sendMessage: (msg: string) => void;
  stopStreaming: () => void;
  // Multi-model API hooks
  getModelId: () => string;
  pushUserMessage: (msg: string) => void;
  appendToken: (token: string) => void;
  markStreamDone: () => void;
  markStreamError: (err: string) => void;
}

interface ChatPaneProps {
  defaultModel?: ModelDef;
  onStreamingChange?: (isStreaming: boolean) => void;
  wrapClassName?: string;
}

const ChatPane = React.forwardRef<ChatPaneHandle, ChatPaneProps>(
  ({ defaultModel = MODELS[0], onStreamingChange, wrapClassName }, ref) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelDef>(defaultModel);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [paneInputOpen, setPaneInputOpen] = useState(false);
  const [paneInput, setPaneInput] = useState('');
  const conversationIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userScrolledUpRef = useRef(false);

  // Only auto-scroll if the user hasn't scrolled up. Use direct scrollTop (no
  // scrollIntoView) so it doesn't fight horizontal scroll of the outer container.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || userScrolledUpRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const setStreamingState = useCallback((val: boolean) => {
    setIsStreaming(val);
    onStreamingChange?.(val);
  }, [onStreamingChange]);

  const runStream = useCallback(async (userMessage: string) => {
    const token = session?.access_token;
    if (!token) return;
    setStreamingState(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    abortRef.current = new AbortController();

    await streamChat(
      conversationIdRef.current, userMessage, selectedModel.id, token,
      (newId) => { conversationIdRef.current = newId; },
      (t) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + t };
          return updated;
        });
      },
      () => { setStreamingState(false); },
      (err) => {
        setError(err);
        setStreamingState(false);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last.role === 'assistant' && last.content === '' ? prev.slice(0, -1) : prev;
        });
      },
      abortRef.current.signal,
    );
  }, [session?.access_token, selectedModel.id, setStreamingState]);

  const stopFn = useCallback(() => {
    abortRef.current?.abort();
    setStreamingState(false);
  }, [setStreamingState]);

  React.useImperativeHandle(ref, () => ({
    sendMessage: (msg: string) => {
      if (isStreaming) return;
      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: msg }]);
      runStream(msg);
    },
    stopStreaming: stopFn,
    getModelId: () => selectedModel.id,
    pushUserMessage: (msg: string) => {
      setError(null);
      setStreamingState(true);
      setMessages((prev) => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: '' }]);
    },
    appendToken: (token: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + token };
        return updated;
      });
    },
    markStreamDone: () => setStreamingState(false),
    markStreamError: (err: string) => {
      setError(err);
      setStreamingState(false);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last.role === 'assistant' && last.content === '' ? prev.slice(0, -1) : prev;
      });
    },
  }), [runStream, isStreaming, stopFn, selectedModel.id, setStreamingState]);

  const retryMessage = async (assistantIdx: number) => {
    if (isStreaming) return;
    const userMsg = messages.slice(0, assistantIdx).filter(m => m.role === 'user').pop();
    if (!userMsg) return;
    setError(null);
    setMessages(messages.slice(0, assistantIdx));
    await runStream(userMsg.content);
  };

  const copyMessage = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { toast({ title: 'Could not copy', variant: 'destructive' }); }
  };

  const shareMessage = async (content: string) => {
    if (navigator.share) {
      try { await navigator.share({ text: content }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied to clipboard', description: 'Share not available — content copied instead.' });
    } catch { toast({ title: 'Could not share', variant: 'destructive' }); }
  };

  const clearChat = () => {
    if (isStreaming) stopFn();
    setMessages([]);
    conversationIdRef.current = null;
    setError(null);
  };

  const handleSendPaneMessage = () => {
    if (isStreaming || !paneInput.trim()) return;
    const msg = paneInput.trim();
    setPaneInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    runStream(msg);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm ${wrapClassName ?? 'flex-1 min-w-0'}`}>
      {/* Pane header — model picker on left, actions on right */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 bg-background">
        <ModelPicker selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        <div className="flex items-center gap-1">
          <button
            onClick={() => shareMessage(messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n\n'))}
            title="Share all responses"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <img src="/icons/share.svg" alt="Share" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={() => {
          const el = scrollContainerRef.current;
          if (!el) return;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
          userScrolledUpRef.current = !atBottom;
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <p className="text-sm text-muted-foreground text-center">Send a message below to start</p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-1 min-w-0 max-w-[88%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed break-words overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap break-words'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {msg.role === 'user' ? msg.content : (
                      <>
                        <MarkdownViewer content={msg.content} />
                        {isStreaming && idx === messages.length - 1 && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-current opacity-70 animate-pulse align-text-bottom" />
                        )}
                      </>
                    )}
                  </div>
                  {msg.role === 'assistant' && msg.content && !(isStreaming && idx === messages.length - 1) && (
                    <div className="flex items-center gap-0.5 px-1">
                      <button onClick={() => copyMessage(msg.content, idx)} title="Copy"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {copiedIdx === idx ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button onClick={() => retryMessage(idx)} title="Retry"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <RotateCcw className="h-3 w-3" />
                      </button>
                      <button onClick={() => shareMessage(msg.content)} title="Share"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Share className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">{error}</div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Per-pane collapsible input */}
      <div className="flex-shrink-0 flex flex-col items-center">
        {!paneInputOpen ? (
          <button
            onClick={() => setPaneInputOpen(true)}
            className="py-1 px-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            title="Send a separate message"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-full px-3 pt-2 pb-1">
            <div className="relative">
              <input
                type="text"
                value={paneInput}
                onChange={(e) => setPaneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendPaneMessage(); }}
                placeholder="Send a separate message..."
                disabled={isStreaming}
                autoFocus
                className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendPaneMessage}
                disabled={isStreaming || !paneInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Send"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="flex justify-center mt-1">
              <button
                onClick={() => { setPaneInputOpen(false); setPaneInput(''); }}
                className="py-0.5 px-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                title="Collapse"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Component ──────────────────────────────────────────────────────────────────

// Default models assigned per pane slot
const PANE_DEFAULT_MODELS: ModelDef[] = [
  MODELS[0],  // GPT-5.4
  MODELS[3],  // Claude Sonnet 4.6
  MODELS[7],  // Gemini 3.1 Pro
  MODELS[12], // DeepSeek V3.2
  MODELS[11], // Gemini 2.5 Flash
  MODELS[13], // DeepSeek R1
];

const AiChatPage: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [paneCount, setPaneCount] = useState<number>(1);
  const paneRefs = useRef<(ChatPaneHandle | null)[]>([]);
  const [sharedInput, setSharedInput] = useState('');
  const [sharedInputExpanded, setSharedInputExpanded] = useState(false);
  const streamingCountRef = useRef(0);
  const [anyStreaming, setAnyStreaming] = useState(false);
  const [multiPaneStarted, setMultiPaneStarted] = useState(false);
  const multiAbortRef = useRef<AbortController | null>(null);
  React.useEffect(() => { if (!anyStreaming) setMultiPaneStarted(false); }, [paneCount]);
  const handlePaneStreamingChange = useCallback((streaming: boolean) => {
    streamingCountRef.current = Math.max(0, streamingCountRef.current + (streaming ? 1 : -1));
    setAnyStreaming(streamingCountRef.current > 0);
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelDef>(MODELS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [loadingConvId, setLoadingConvId] = useState<string | null>(null);
  const documentIdRef = useRef<string | null>(null);
  const webSearchRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // GET /api/chat/conversations
  const fetchConversations = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setSidebarLoading(true);
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConversations(await res.json());
    } finally {
      setSidebarLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const runStream = useCallback(async (
    userMessage: string,
    convId: string | null,
    docId?: string | null,
    useWebSearch?: boolean,
  ) => {
    const token = session?.access_token;
    if (!token) return;
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    abortRef.current = new AbortController();

    await streamChat(
      convId, userMessage, selectedModel.id, token,
      (newId) => {
        setConversationId(newId);
        convId = newId;
      },
      (t) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + t };
          return updated;
        });
      },
      () => {
        setIsStreaming(false);
        fetchConversations(); // refresh sidebar
      },
      (err) => {
        setError(err);
        setIsStreaming(false);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last.role === 'assistant' && last.content === '' ? prev.slice(0, -1) : prev;
        });
      },
      abortRef.current.signal,
      docId,
      useWebSearch,
    );
  }, [session?.access_token, selectedModel.id, fetchConversations]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    if (!session?.access_token) { setError('Not authenticated. Please sign in again.'); return; }
    setError(null);
    const docId = documentIdRef.current;
    documentIdRef.current = null;
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    await runStream(trimmed, conversationId, docId, webSearchRef.current);
  };

  const retryMessage = async (assistantIdx: number) => {
    if (isStreaming || !conversationId) return;
    // Re-send the user message that preceded this assistant reply
    const userMsg = messages.slice(0, assistantIdx).filter(m => m.role === 'user').pop();
    if (!userMsg) return;
    const context = messages.slice(0, assistantIdx);
    setError(null);
    setMessages(context);
    await runStream(userMsg.content, conversationId);
  };

  const copyMessage = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { toast({ title: 'Could not copy', variant: 'destructive' }); }
  };

  const shareMessage = async (content: string) => {
    if (navigator.share) {
      try { await navigator.share({ text: content }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied to clipboard', description: 'Share not available — content copied instead.' });
    } catch { toast({ title: 'Could not share', variant: 'destructive' }); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const stopStreaming = () => { abortRef.current?.abort(); setIsStreaming(false); };

  const clearChat = () => {
    if (isStreaming) stopStreaming();
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  // GET /api/chat/conversations/:id
  const loadConversation = async (conv: ConversationRow) => {
    if (isStreaming) stopStreaming();
    setError(null);
    // Switch to single-pane so the conversation is visible
    setPaneCount(1);
    setConversationId(conv.id);
    setLoadingConvId(conv.id);
    const token = session?.access_token;
    if (!token) { setLoadingConvId(null); return; }

    const res = await fetch(`/api/chat/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoadingConvId(null);
    setSidebarOpen(false);
    if (!res.ok) { setError('Could not load conversation.'); return; }
    const data = await res.json();
    setMessages(data.messages ?? []);
    const model = MODELS.find(m => m.id === (data.conversation?.model ?? conv.model)) ?? MODELS[0];
    setSelectedModel(model);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistically remove from sidebar; backend cleanup handled server-side
    setConversations(prev => prev.filter(c => c.id !== id));
    if (conversationId === id) clearChat();
    const token = session?.access_token;
    if (token) {
      fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { /* best effort */ });
    }
  };

  // ── Inline sidebar panel ──────────────────────────────────────────────────
  const SidebarPanel = () => (
    <div className="flex-shrink-0 flex h-full self-stretch">
      <div className={`flex-shrink-0 bg-background flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-60' : 'w-0'}`}>
      {/* Header — close button only */}
      <div className="flex items-center justify-end px-4 py-3 min-w-[15rem]">
        <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 w-7 h-7 flex items-center justify-center border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer" title="Close">
          <img src="/icons/sidebar.svg" alt="Close sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
        </button>
      </div>
      {/* New Chat */}
      <div className="px-3 pt-1 pb-3 min-w-[15rem]">
        <button
          onClick={() => { clearChat(); setSidebarOpen(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-base font-medium border border-border/70 hover:bg-muted/60 text-foreground transition-colors"
        >
          <img src="/icons/message.svg" alt="New chat" className="h-5 w-5" />
          New Chat
        </button>
      </div>
      {/* Sessions */}
      <div className="px-4 py-2 min-w-[15rem]">
        <p className="text-xs text-muted-foreground font-medium">Recent Chats</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 min-w-[15rem]">
        {sidebarLoading && (
          <p className="text-xs text-muted-foreground text-center py-6">Loading…</p>
        )}
        {!sidebarLoading && conversations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No recent chats</p>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => loadConversation(conv)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
              conversationId === conv.id ? 'bg-muted' : ''
            }`}
          >
            {loadingConvId === conv.id
              ? <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-muted-foreground" />
              : null
            }
            <span className="flex-1 truncate text-sm text-foreground">{conv.title}</span>
            {loadingConvId !== conv.id && (
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                title="Delete"
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      </div>{/* end collapsible inner */}
    </div>
  );
  const TopBar = ({ showSidebarToggle = true }: { showSidebarToggle?: boolean }) => (
    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-background">
      <div className="w-8">
        {showSidebarToggle && !sidebarOpen && conversations.length > 0 && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Recent chats"
          >
            <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        )}
      </div>
      <PaneSelector paneCount={paneCount} setPaneCount={setPaneCount} />
      <div className="w-8" />
    </div>
  );

  // ── Multi-pane layout ──────────────────────────────────────────────────────
  if (paneCount > 1) {
    const handleSendAll = () => {
      const msg = sharedInput.trim();
      if (!msg || !session?.access_token) return;
      setSharedInput('');
      setMultiPaneStarted(true);

      const activePanes = paneRefs.current.slice(0, paneCount);
      const models = activePanes
        .map((r, i) => r ? { model_id: r.getModelId(), panel_id: i } : null)
        .filter(Boolean) as Array<{ model_id: string; panel_id: number }>;

      // Push user message to each pane immediately
      activePanes.forEach(r => r?.pushUserMessage(msg));

      // Single multi-model SSE stream
      const abortCtrl = new AbortController();
      multiAbortRef.current = abortCtrl;
      streamChatMultiModel(
        msg,
        models,
        session.access_token,
        (panelId, token) => paneRefs.current[panelId]?.appendToken(token),
        (panelId) => paneRefs.current[panelId]?.markStreamDone(),
        (panelId, err) => paneRefs.current[panelId]?.markStreamError(err),
        abortCtrl.signal,
      );
    };

    const handleSharedKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendAll(); }
    };

    const stopAll = () => {
      multiAbortRef.current?.abort();
      multiAbortRef.current = null;
      streamingCountRef.current = 0;
      setAnyStreaming(false);
      paneRefs.current.slice(0, paneCount).forEach(r => r?.stopStreaming());
    };

    return (
      <div className="flex h-full overflow-hidden flex-col bg-muted/40">
        {!multiPaneStarted && !anyStreaming && <TopBar />}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <SidebarPanel />
          {/* Card panes */}
          {paneCount === 6 ? (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <div className="grid grid-cols-3 grid-rows-2 gap-2 flex-1 min-h-0 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ChatPane
                    key={i}
                    ref={(el) => { paneRefs.current[i] = el; }}
                    defaultModel={PANE_DEFAULT_MODELS[i] ?? MODELS[0]}
                    onStreamingChange={handlePaneStreamingChange}
                    wrapClassName="min-w-0 min-h-0"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`flex flex-1 min-h-0 p-2 gap-2 ${paneCount >= 3 ? 'overflow-x-auto thin-scrollbar' : 'overflow-hidden'}`}>
            {Array.from({ length: paneCount }).map((_, i) => (
              <ChatPane
                key={i}
                ref={(el) => { paneRefs.current[i] = el; }}
                defaultModel={PANE_DEFAULT_MODELS[i] ?? MODELS[0]}
                onStreamingChange={handlePaneStreamingChange}
                wrapClassName={paneCount === 4 ? 'flex-none w-[28%] shrink-0' : paneCount >= 3 ? 'flex-none w-[40%] shrink-0' : 'flex-1 min-w-0'}
              />
            ))}
            </div>
          )}
        </div>
        {/* Single shared input — aligned under panes, not under sidebar */}
        <div className="flex-shrink-0 bg-background flex">
          <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-60' : 'w-0'}`} />
          <div className="flex-1 px-3 py-1.5">
          <div className="relative">
            <Textarea
              value={sharedInput}
              onChange={(e) => setSharedInput(e.target.value)}
              onKeyDown={handleSharedKeyDown}
              placeholder="Ask anything…"
              disabled={anyStreaming}
              className={`w-full resize-none rounded-xl border border-border bg-background focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:border-purple-400 text-sm px-4 py-1.5 pr-12 focus-visible:outline-none overflow-y-auto transition-all duration-200 ${sharedInputExpanded ? 'h-28' : 'h-[2rem]'}`}
              autoFocus
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                onClick={() => setSharedInputExpanded(v => !v)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                title={sharedInputExpanded ? 'Collapse' : 'Expand'}
              >
                {sharedInputExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              {anyStreaming ? (
                <button onClick={stopAll} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors" title="Stop all">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </button>
              ) : (
                <button onClick={handleSendAll} disabled={!sharedInput.trim()} className="p-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Send">
                  <Send className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Landing view (single pane) ─────────────────────────────────────────────
  if (messages.length === 0 && !loadingConvId && !conversationId) {
    return (
      <div className="flex h-full overflow-hidden">
        <SidebarPanel />
        <div className="flex-1 overflow-y-auto thin-scrollbar relative">
          {/* Sidebar toggle */}
          {!sidebarOpen && conversations.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-1 left-3 z-50 flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
              title="Recent chats"
            >
              <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
            </button>
          )}
          {/* Pane selector — floating top-center */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <PaneSelector paneCount={paneCount} setPaneCount={setPaneCount} />
          </div>
          <div className="container max-w-4xl mx-auto px-6 py-8 pt-32">
            <div className="flex flex-col items-center space-y-6 mb-32">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600">
                  What can I help you with today?
                </span>
              </h1>
            </div>
            <div className="w-full flex flex-col gap-6">
              <InputBox input={input} setInput={setInput} handleKeyDown={handleKeyDown} isStreaming={isStreaming} sendMessage={sendMessage} stopStreaming={stopStreaming} selectedModel={selectedModel} setSelectedModel={setSelectedModel} onDocumentReady={(id) => { documentIdRef.current = id || null; }} onWebSearchChange={(v) => { webSearchRef.current = v; }} />
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view (single pane) ────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      <SidebarPanel />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Sidebar toggle */}
        {!sidebarOpen && conversations.length > 0 && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-1 left-3 z-50 flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Recent chats"
          >
            <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        )}

          {/* Messages — scrollable */}
          <div className="flex-1 overflow-y-auto thin-scrollbar">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed w-full ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap break-words'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {msg.role === 'user' ? msg.content : (
                        <>
                          <MarkdownViewer content={msg.content} />
                          {isStreaming && idx === messages.length - 1 && (
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current opacity-70 animate-pulse align-text-bottom" />
                          )}
                        </>
                      )}
                    </div>

                    {/* Action bar */}
                    {msg.role === 'assistant' && msg.content && !(isStreaming && idx === messages.length - 1) && (
                      <div className="flex items-center gap-0.5 px-1">
                        <button onClick={() => copyMessage(msg.content, idx)} title="Copy"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => retryMessage(idx)} title="Regenerate"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => shareMessage(msg.content)} title="Share"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Share className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Fixed input at bottom */}
          <div className="flex-shrink-0 bg-background py-3 px-4">
            <div className="max-w-4xl mx-auto">
              <InputBox compact input={input} setInput={setInput} handleKeyDown={handleKeyDown} isStreaming={isStreaming} sendMessage={sendMessage} stopStreaming={stopStreaming} selectedModel={selectedModel} setSelectedModel={setSelectedModel} onDocumentReady={(id) => { documentIdRef.current = id || null; }} onWebSearchChange={(v) => { webSearchRef.current = v; }} />
            </div>
          </div>
        </div>
    </div>
  );
};

export default AiChatPage;
