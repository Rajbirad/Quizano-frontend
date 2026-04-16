import { toast as sonnerToast } from 'sonner';

function isSuccessLikeText(value: unknown): boolean {
  return typeof value === 'string' && /\bsuccess(?:fully)?\b/i.test(value);
}

function shouldSuppressSuccessToast(message?: unknown, data?: { title?: unknown; description?: unknown }): boolean {
  if (isSuccessLikeText(message)) return true;
  if (isSuccessLikeText(data?.title)) return true;
  if (isSuccessLikeText(data?.description)) return true;

  if (message && typeof message === 'object') {
    const msgObj = message as { title?: unknown; description?: unknown };
    if (isSuccessLikeText(msgObj.title) || isSuccessLikeText(msgObj.description)) return true;
  }

  return false;
}

const toast = Object.assign(
  ((message?: unknown, data?: { title?: unknown; description?: unknown }) => {
    if (shouldSuppressSuccessToast(message, data)) return '' as ReturnType<typeof sonnerToast>;
    return sonnerToast(message as Parameters<typeof sonnerToast>[0], data as Parameters<typeof sonnerToast>[1]);
  }) as typeof sonnerToast,
  sonnerToast,
  {
    success: (() => '' as ReturnType<typeof sonnerToast.success>) as typeof sonnerToast.success,
  }
);

export { toast };
