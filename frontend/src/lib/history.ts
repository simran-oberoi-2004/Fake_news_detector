import type { HistoryItem, PredictResponse } from "../types";

const KEY = "trueverse_history_v1";
const MAX = 80;

function id(): string {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function pushHistory(
  kind: "text" | "url",
  input: string,
  result: PredictResponse
): HistoryItem[] {
  if (result.error) {
    return loadHistory();
  }
  const item: HistoryItem = {
    id: id(),
    t: Date.now(),
    kind,
    input: input.slice(0, 2000),
    result: { ...result, full_text: result.full_text ? "[omitted]" : undefined },
  };
  const next = [item, ...loadHistory()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // quota
  }
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
