import type { HealthResponse, PredictResponse } from "../types";
import type { ModelChoice } from "../types";

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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, model }),
  });
  return readJsonOrThrow<PredictResponse>(r, "POST /predict_url");
}
