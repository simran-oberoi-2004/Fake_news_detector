import type { HealthResponse, PredictResponse } from "../types";
import type { ModelChoice } from "../types";
import { authHeaders, type AuthResponse } from "./auth";

const API_HINT =
  "Start the API in a second terminal: cd into the project’s app folder, then run: uvicorn api:app --reload --port 8000";

function getBase(): string {
  const b = import.meta.env.VITE_API_BASE;
  if (b && b.length > 0) return b.replace(/\/$/, "");
  return "/api";
}

async function readJsonOrThrow<T>(r: Response, context: string): Promise<T> {
  const raw = await r.text();
  if (!raw.trim()) {
    const st = r.status;
    if (st === 502 || st === 500 || st === 503) {
      throw new Error(
        `${context} failed (HTTP ${st}, empty body). The dev server could not reach the API. ${API_HINT}`,
      );
    }
    if (!r.ok) {
      throw new Error(
        `${context} failed (HTTP ${st}). ${API_HINT}. If the API is running, try in frontend/.env: VITE_API_BASE=http://127.0.0.1:8000 and restart \"npm run dev\".`,
      );
    }
    throw new Error(`${context} returned an empty body. ${API_HINT}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `${context} returned non-JSON (HTTP ${r.status}): ${raw.slice(0, 180).replace(/\s+/g, " ")}${raw.length > 180 ? "…" : ""}`,
    );
  }
}

export async function apiHealth(): Promise<HealthResponse> {
  const r = await fetch(`${getBase()}/health`);
  return readJsonOrThrow<HealthResponse>(r, "GET /health");
}

export async function authSignup(email: string, password: string): Promise<AuthResponse> {
  const r = await fetch(`${getBase()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return readJsonOrThrow<AuthResponse>(r, "POST /auth/signup");
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const r = await fetch(`${getBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return readJsonOrThrow<AuthResponse>(r, "POST /auth/login");
}

export async function authMe(): Promise<{ error?: string; user?: { id: string; email: string } }> {
  const r = await fetch(`${getBase()}/auth/me`, {
    headers: await authHeaders(),
  });
  return readJsonOrThrow(r, "GET /auth/me");
}

export async function apiMetrics(): Promise<Record<string, unknown>> {
  const r = await fetch(`${getBase()}/metrics`);
  return readJsonOrThrow<Record<string, unknown>>(r, "GET /metrics");
}

export async function apiUsage(): Promise<{
  totals: { predictions: number; url_runs: number };
  by_model: Record<string, number>;
  by_verdict_category: Record<string, number>;
}> {
  const r = await fetch(`${getBase()}/analytics/usage`);
  return readJsonOrThrow(r, "GET /analytics/usage");
}

export async function predictText(
  text: string,
  model: ModelChoice,
): Promise<PredictResponse> {
  const r = await fetch(`${getBase()}/predict`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text, model }),
  });
  return readJsonOrThrow<PredictResponse>(r, "POST /predict");
}

export async function predictUrl(
  url: string,
  model: ModelChoice,
): Promise<PredictResponse> {
  const r = await fetch(`${getBase()}/predict_url`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ url, model }),
  });
  return readJsonOrThrow<PredictResponse>(r, "POST /predict_url");
}

export async function extractPdfText(file: File): Promise<{
  error?: string;
  filename?: string;
  text_preview?: string;
  full_text?: string;
  char_count?: number;
}> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${getBase()}/extract_pdf_text`, {
    method: "POST",
    headers: await authHeaders(),
    body: fd,
  });
  return readJsonOrThrow(r, "POST /extract_pdf_text");
}

export async function predictPdf(
  file: File,
  model: ModelChoice,
): Promise<PredictResponse> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("model", model);
  const r = await fetch(`${getBase()}/predict_pdf`, {
    method: "POST",
    headers: await authHeaders(),
    body: fd,
  });
  return readJsonOrThrow<PredictResponse>(r, "POST /predict_pdf");
}

export async function getServerHistory(filters?: {
  date_from?: number;
  verdict?: string;
  min_confidence?: number;
}): Promise<{ error?: string; items?: import("../types").HistoryItem[] }> {
  const p = new URLSearchParams();
  if (filters?.date_from != null) p.set("date_from", String(filters.date_from));
  if (filters?.verdict) p.set("verdict", filters.verdict);
  if (filters?.min_confidence != null) p.set("min_confidence", String(filters.min_confidence));
  const qs = p.toString();
  const r = await fetch(`${getBase()}/history${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return readJsonOrThrow(r, "GET /history");
}

export async function deleteServerHistory(): Promise<{ error?: string; deleted?: number }> {
  const r = await fetch(`${getBase()}/history`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return readJsonOrThrow(r, "DELETE /history");
}

export async function createShareLink(payload: {
  source_type: string;
  input: string;
  result: PredictResponse;
}): Promise<{ error?: string; share_id?: string }> {
  const r = await fetch(`${getBase()}/share/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJsonOrThrow(r, "POST /share/create");
}

export async function getSharedResult(shareId: string): Promise<{
  error?: string;
  share_id?: string;
  kind?: string;
  input?: string;
  result?: PredictResponse;
  created_at?: number;
}> {
  const r = await fetch(`${getBase()}/result/${encodeURIComponent(shareId)}`);
  return readJsonOrThrow(r, "GET /result/{share_id}");
}
