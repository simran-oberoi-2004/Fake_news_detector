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
  claims_extracted?: string[];
  fact_check_provider?: string;
  fact_check_status?: string;
  fact_checks?: {
    query_claim: string;
    matched_claim: string;
    source_name: string;
    rating: string;
    url: string;
  }[];
  sentence_claims?: {
    sentence: string;
    label: string;
    confidence: number;
    confidence_pct: number;
    severity: "high" | "medium" | "safe";
  }[];
  share_id?: string;
  detected_language?: string;
  language_model?: string;
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
  kind: "text" | "url" | "file";
  input: string;
  result: PredictResponse;
  share_id?: string;
}

export interface UserInfo {
  id: string;
  email: string;
}
