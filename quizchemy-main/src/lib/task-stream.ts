/**
 * SSE-based task status streaming.
 *
 * Connects to a backend SSE endpoint and resolves when the task completes or fails.
 *
 * Supports the FastAPI named-event format:
 *   event: progress\ndata: {"status":"processing","message":"..."}\n\n
 *   event: completed\ndata: {"task_id":"...","status":"completed",...}\n\n
 *   event: failed\ndata: {"task_id":"...","status":"failed","error":"..."}\n\n
 *
 * Terminal state is detected by EITHER the named `event:` type OR `status` inside
 * the JSON payload — whichever arrives first.
 *
 * TRANSIENT ERRORS — automatic reconnect:
 *   The backend sends `event: failed` with `error: "Connection lost"` when its
 *   internal Redis pub/sub reader drops. That is NOT a real task failure; the Celery
 *   worker is still running. We treat a short list of known transient error strings as
 *   reconnect triggers rather than hard failures, sleeping briefly then re-opening the
 *   SSE connection (up to `maxReconnects` times).
 *
 * Heartbeat comment lines (`: `) are silently ignored per the SSE spec.
 *
 * Auth is sent via Bearer token header (same pattern as all other API calls).
 * fetch + ReadableStream is used instead of EventSource to support custom headers.
 */

import { supabase } from '@/integrations/supabase/client';

export interface TaskStreamEvent {
  status: string;
  result?: any;
  meta?: any;
  error?: string;
  message?: string;
  progress?: number;
  [key: string]: any;
}

export interface TaskStreamOptions {
  /** Called for every non-terminal event (progress / pending / processing). */
  onProgress?: (event: TaskStreamEvent) => void;
  /** External AbortSignal — e.g. tied to component unmount. */
  signal?: AbortSignal;
  /** Hard timeout in ms. Defaults to 6 minutes (matches backend deadline). */
  timeoutMs?: number;
  /**
   * Override the SSE endpoint URL.
   * Defaults to `/api/task/status/stream/{taskId}` (the generic backend endpoint).
   * Example: `(id) => \`/api/tts/status/stream/${id}\``
   */
  endpoint?: (taskId: string) => string;
  /**
   * How many times to silently reconnect on transient errors before giving up.
   * Defaults to 5.
   */
  maxReconnects?: number;
}

/**
 * Errors sent by the backend that mean "pub/sub dropped, task still running".
 * Matching is case-insensitive substring.
 */
const TRANSIENT_ERRORS = [
  'connection lost',
  'stream timeout',       // backend deadline exceeded — re-connect to get final state
  'connection dropped',
];

function isTransient(error: string): boolean {
  const lower = error.toLowerCase();
  return TRANSIENT_ERRORS.some((t) => lower.includes(t));
}

/**
 * Connect to the backend SSE endpoint and resolve when the task completes.
 * Automatically reconnects on transient "Connection lost" signals.
 * Throws on real task failure, hard timeout, or cancellation.
 */
export async function streamTaskStatus(
  taskId: string,
  options: TaskStreamOptions = {},
): Promise<TaskStreamEvent> {
  const {
    onProgress,
    signal: externalSignal,
    timeoutMs = 360_000,
    endpoint = (id) => `/api/task/status/stream/${id}`,
    maxReconnects = 5,
  } = options;

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required. Please sign in.');
  }

  // One AbortController + timeout guard the entire lifetime across all reconnects.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort);

  let reconnects = 0;

  try {
    while (true) {
      if (controller.signal.aborted) {
        throw new Error('Task timed out or was cancelled');
      }

      try {
        const result = await _connectOnce(
          taskId,
          endpoint,
          session.access_token,
          session.user?.id ?? '',
          controller.signal,
          onProgress,
        );
        return result; // ✅ completed
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        // AbortError = timeout or user cancel — propagate immediately
        if ((err as Error).name === 'AbortError' || msg === 'Task timed out or was cancelled') {
          throw new Error('Task timed out or was cancelled');
        }

        // Transient: reconnect up to maxReconnects times
        if (isTransient(msg) && reconnects < maxReconnects) {
          reconnects++;
          const delay = Math.min(1000 * reconnects, 5000); // 1s, 2s, 3s … capped at 5s
          console.warn(
            `[task-stream] Transient disconnect for ${taskId} (attempt ${reconnects}/${maxReconnects}): "${msg}". Reconnecting in ${delay}ms…`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue; // re-open SSE connection
        }

        // Real failure or retries exhausted
        throw err;
      }
    }
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

/** Open a single SSE connection and read until a terminal event or stream end. */
async function _connectOnce(
  taskId: string,
  endpoint: (id: string) => string,
  accessToken: string,
  userId: string,
  signal: AbortSignal,
  onProgress?: (event: TaskStreamEvent) => void,
): Promise<TaskStreamEvent> {
  const response = await fetch(endpoint(taskId), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-User-ID': userId,
      'X-Supabase-Token': accessToken,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null — server does not support SSE streaming');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are delimited by \n\n — split into complete blocks.
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      if (!block.trim()) continue;

      let eventType = 'message';
      let dataRaw = '';

      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataRaw += (dataRaw ? '\n' : '') + line.slice(5).trim();
        }
        // Ignore `id:`, `retry:`, heartbeat comments (`:`)
      }

      if (!dataRaw || dataRaw === '[DONE]') continue;

      let payload: TaskStreamEvent;
      try {
        payload = JSON.parse(dataRaw);
      } catch {
        continue;
      }

      const isCompleted = eventType === 'completed' || payload.status === 'completed';
      const isFailed    = eventType === 'failed'    || payload.status === 'failed';

      if (isCompleted) {
        return payload;
      } else if (isFailed) {
        // Throw so the outer loop can decide: transient → reconnect, real → propagate
        throw new Error(payload.error || 'Task failed');
      } else {
        onProgress?.(payload);
      }
    }
  }

  // Stream closed without a terminal event — treat as transient so caller can retry
  throw new Error('Connection lost');
}
