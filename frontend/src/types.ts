export type ModelChoice = "auto" | "hybrid" | "baseline" | "keyword";

export interface Verdict {
  key: string;
  title: string;
  description: string;
}

export interface PredictResponse {
  error?: string;
  label?: string;
  confidence?: number;
  model?: string;
  verdict?: Verdict;
  credibility_score_0_100?: number;
  style_signals?: {
    sensational_hits: string[];
    hedging_hits: string[];
    trust_markers: string[];
    exclamation_count: number;
    all_caps_token_ratio: number;
  };
  highlight_terms?: string[];
  explainable_ai?: {
    summary: string;
    factors: string[];
  };
  title?: string;
  text_preview?: string;
  full_text?: string;
  scraper_method?: string;
}

export interface HealthResponse {
  status: string;
  service?: string;
  baseline_loaded: boolean;
  hybrid_loaded: boolean;
}

export interface HistoryItem {
  id: string;
  t: number;
  kind: "text" | "url";
  input: string;
  result: PredictResponse;
}
