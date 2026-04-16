const STORAGE_KEY = 'recent-generated-tools';
const MAX_ITEMS = 5;

export function trackRecentTool(path: string): void {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = [path, ...existing.filter(p => p !== path)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getRecentTools(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
