import os
import sys

# Support `uvicorn app.api:app` from repo root: load scraper/ and models next to this file, not the shell CWD
_APP_DIR = os.path.dirname(os.path.abspath(__file__))
if _APP_DIR not in sys.path:
    sys.path.insert(0, _APP_DIR)
_MODELS_DIR = os.path.join(_APP_DIR, "models")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
import pickle
import json
import re

from scraper import scrape_article

app = FastAPI(title="TRUEVERSE Fake News API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

METRICS_PATH = os.path.join(os.path.dirname(__file__), "model_metrics.json")


def load_default_metrics() -> dict:
    return {
        "project": "TRUEVERSE",
        "dataset": {
            "name": "LIAR (PolitiFact)",
            "statements": 12836,
            "split_train": 10269,
            "split_valid": 1284,
            "split_test": 1283,
        },
        "models": {
            "hybrid": {
                "name": "BERT + Random Forest",
                "role": "Primary",
                "approx_accuracy": 0.62,
                "f1": 0.58,
                "avg_latency_ms": 200,
            },
            "baseline": {
                "name": "TF–IDF + Logistic Regression",
                "role": "Fast fallback",
                "approx_accuracy": 0.60,
                "f1": 0.55,
                "avg_latency_ms": 50,
            },
            "keyword": {
                "name": "Heuristic / keyword",
                "role": "Last resort",
                "approx_accuracy": 0.55,
                "f1": None,
                "avg_latency_ms": 5,
            },
        },
    }


def load_metrics() -> dict:
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, encoding="utf-8") as f:
                data = json.load(f)
            base = load_default_metrics()
            base.update(data)
            return base
        except Exception as e:
            print(f"Could not read metrics file: {e}")
    return load_default_metrics()


class TextRequest(BaseModel):
    text: str
    model: str = "auto"


class URLRequest(BaseModel):
    url: str
    model: str = "auto"

# Global variables for models
baseline_model = None
vectorizer = None
hybrid_model = None
bert_tokenizer = None
bert_model = None

# Privacy-safe global counters (no user text)
_stats = {
    "predictions_total": 0,
    "url_predictions": 0,
    "by_model": {},
    "by_verdict": {},
}

SENSATIONAL = [
    "shocking", "viral", "urgent", "guaranteed", "100%", "amazing", "unbelievable",
    "doctors hate", "they don", "media won", "secret", "covered up", "won't believe",
    "insane", "destroy", "catastrophe", "immediately", "act now",
]
HEDGING = [
    "allegedly", "rumor", "unconfirmed", "reportedly", "sources say", "claim",
    "supposedly", "may have", "could be", "apparently",
]
TRUST = [
    "study", "peer-reviewed", "published", "data shows", "according to", "evidence",
    "research", "confirmed by", "preprint",
]

WORD_RE = re.compile(r"\b\w+\b", re.IGNORECASE)


def analyze_style(text: str) -> dict:
    t = (text or "").lower()
    sensational_hits = [w for w in SENSATIONAL if w in t]
    hedging_hits = [w for w in HEDGING if w in t]
    trust_hits = [w for w in TRUST if w in t]
    words = text.split() if text else []
    n_words = max(len(words), 1)
    caps_tokens = sum(1 for w in words if w.isupper() and len(w) > 1)
    exclam = text.count("!") if text else 0
    return {
        "sensational_hits": sensational_hits[:8],
        "hedging_hits": hedging_hits[:8],
        "trust_markers": trust_hits[:8],
        "exclamation_count": exclam,
        "all_caps_token_ratio": round(caps_tokens / n_words, 3),
    }


def extract_highlight_tokens(text: str, max_tokens: int = 24) -> list:
    if not text:
        return []
    out = set()
    lower = text.lower()
    for group in (SENSATIONAL, HEDGING, TRUST):
        for w in group:
            if w in lower:
                for m in re.finditer(re.escape(w), lower, re.IGNORECASE):
                    span = m.group(0)
                    if span not in out:
                        out.add(span)
    for m in WORD_RE.finditer(text):
        w = m.group(0)
        if len(w) > 2 and w.isupper():
            out.add(w)
    return list(out)[:max_tokens]


def four_way_verdict(label: str, confidence: float, style: dict) -> dict:
    """Map binary/N-way model output to synopsis-style categories."""
    L = (label or "").lower()
    sens = len(style.get("sensational_hits", []))
    if L == "uncertain":
        key = "partially_true"
        title = "Partially credible / needs review"
        detail = "The model is not confident. Treat as mixed or incomplete information."
    elif L == "fake" and confidence >= 0.55:
        key = "fake"
        title = "Likely false or unverified"
        detail = "Strong signal toward inauthentic or misleading content."
    elif L == "fake":
        key = "misleading"
        title = "Possibly misleading"
        detail = "Flagged as not credible, but with lower confidence; verify sources."
    elif L == "real" and sens >= 4 and confidence < 0.8:
        key = "misleading"
        title = "Credible-sounding but sensational"
        detail = "Looks factual but may use manipulative or sensational framing — verify key claims."
    elif L == "real" and confidence >= 0.6:
        key = "reliable"
        title = "Likely reliable"
        detail = "Leans toward authentic, verifiable phrasing. Still confirm important claims."
    else:
        key = "partially_true"
        title = "Review recommended"
        detail = "Borderline: combine this score with other sources and fact checks."

    return {"key": key, "title": title, "description": detail}


def attach_explanation(base: dict, text: str) -> dict:
    style = analyze_style(text)
    highlights = extract_highlight_tokens(text)
    v = four_way_verdict(
        base.get("label", "Uncertain"),
        float(base.get("confidence") or 0.5),
        style,
    )
    credibility = base.get("confidence", 0.0)
    if isinstance(credibility, (int, float)):
        cr_score = int(round(float(credibility) * 100))
    else:
        cr_score = 0

    base["style_signals"] = style
    base["highlight_terms"] = highlights
    base["verdict"] = v
    base["credibility_score_0_100"] = cr_score
    base["explainable_ai"] = {
        "summary": v["description"],
        "factors": [
            f"Sensational language markers: {len(style['sensational_hits'])}",
            f"Hedging / uncertainty phrases: {len(style['hedging_hits'])}",
            f"Exclamation marks in text: {style['exclamation_count']}",
            f"Model used: {base.get('model', 'auto')}",
        ],
    }
    return base


def bump_stats(model_name: str, verdict_key: str) -> None:
    _stats["predictions_total"] += 1
    _stats["by_model"][model_name] = _stats["by_model"].get(model_name, 0) + 1
    _stats["by_verdict"][verdict_key] = _stats["by_verdict"].get(verdict_key, 0) + 1


def load_baseline_model():
    global baseline_model, vectorizer

    if os.path.exists(os.path.join(_MODELS_DIR, "baseline_model.pkl")) and os.path.exists(
        os.path.join(_MODELS_DIR, "vectorizer.pkl")
    ):
        try:
            with open(os.path.join(_MODELS_DIR, "baseline_model.pkl"), "rb") as f:
                baseline_model = pickle.load(f)
            with open(os.path.join(_MODELS_DIR, "vectorizer.pkl"), "rb") as f:
                vectorizer = pickle.load(f)
            print("Baseline model loaded successfully")
            return True
        except Exception as e:
            print(f"Failed to load baseline model: {e}")
            return False
    else:
        print("Baseline model files not found")
        return False


def load_hybrid_model():
    global hybrid_model, bert_tokenizer, bert_model

    if (
        os.path.exists(os.path.join(_MODELS_DIR, "hybrid_model.pkl"))
        and os.path.exists(os.path.join(_MODELS_DIR, "bert_tokenizer"))
        and os.path.exists(os.path.join(_MODELS_DIR, "bert_embedder"))
    ):
        try:
            with open(os.path.join(_MODELS_DIR, "hybrid_model.pkl"), "rb") as f:
                hybrid_model = pickle.load(f)
            bert_tokenizer = BertTokenizer.from_pretrained(
                os.path.join(_MODELS_DIR, "bert_tokenizer")
            )
            bert_model = BertModel.from_pretrained(
                os.path.join(_MODELS_DIR, "bert_embedder")
            )
            print("Hybrid model loaded successfully")
            return True
        except Exception as e:
            print(f"Failed to load hybrid model: {e}")
            return False
    else:
        print("Hybrid model files not found")
        return False


def predict_with_baseline(text):
    if baseline_model is None or vectorizer is None:
        return None

    text_vector = vectorizer.transform([text])
    prediction = baseline_model.predict(text_vector)[0]
    probabilities = baseline_model.predict_proba(text_vector)[0]
    confidence = float(max(probabilities))

    label = "Real" if prediction == 1 else "Fake"
    return {"label": label, "confidence": round(confidence, 3)}


def predict_with_hybrid(text):
    if hybrid_model is None or bert_tokenizer is None or bert_model is None:
        return None

    bert_model.eval()
    with torch.no_grad():
        dev = next(bert_model.parameters()).device
        inputs = bert_tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=256,
        )
        inputs = {k: v.to(dev) for k, v in inputs.items()}
        outputs = bert_model(**inputs)
        embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy().reshape(1, -1)

    prediction = hybrid_model.predict(embedding)[0]
    probabilities = hybrid_model.predict_proba(embedding)[0]
    confidence = float(max(probabilities))

    label = "Real" if prediction == 1 else "Fake"
    return {"label": label, "confidence": round(confidence, 3), "model": "hybrid"}


# Load models on startup
load_baseline_model()
load_hybrid_model()


def predict_with_keywords(text):
    fake_keywords = ["fake", "false", "lie", "hoax", "scam", "fraud"]
    real_keywords = ["true", "fact", "verified", "confirmed", "official"]

    text_lower = text.lower()
    fake_score = sum(1 for word in fake_keywords if word in text_lower)
    real_score = sum(1 for word in real_keywords if word in text_lower)

    if fake_score > real_score:
        return {"label": "Fake", "confidence": 0.6, "model": "keyword"}
    if real_score > fake_score:
        return {"label": "Real", "confidence": 0.6, "model": "keyword"}
    return {"label": "Uncertain", "confidence": 0.5, "model": "keyword"}


@app.post("/predict")
def predict(request: TextRequest):
    text = request.text.strip()
    model_choice = request.model
    if not text:
        return {"error": "Empty text provided"}

    if model_choice == "hybrid":
        result = predict_with_hybrid(text)
        if result is None:
            return {"error": "Hybrid model not available"}
    elif model_choice == "baseline":
        result = predict_with_baseline(text)
        if result is None:
            return {"error": "Baseline model not available"}
        result["model"] = "baseline"
    elif model_choice == "keyword":
        result = predict_with_keywords(text)
    else:
        result = predict_with_hybrid(text)
        if result is not None:
            pass
        else:
            result = predict_with_baseline(text)
            if result is not None:
                result["model"] = "baseline"
            else:
                result = predict_with_keywords(text)

    result = attach_explanation(result, text)
    mname = str(result.get("model", "unknown"))
    bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))
    return result


@app.post("/predict_url")
def predict_url(request: URLRequest):
    url = request.url.strip()
    model_choice = request.model
    if not url:
        return {"error": "Empty URL provided"}

    try:
        print(f"Attempting to scrape: {url}")
        article_data = scrape_article(url)
        print(f"Scrape result: {bool(article_data)}")
        if not article_data:
            return {"error": "Failed to extract article content from URL"}
    except Exception as e:
        print(f"Scraping error: {str(e)}")
        return {"error": f"Scraping failed: {str(e)}"}

    text = article_data["text"]

    if model_choice == "hybrid":
        result = predict_with_hybrid(text)
        if result is None:
            return {"error": "Hybrid model not available"}
    elif model_choice == "baseline":
        result = predict_with_baseline(text)
        if result is None:
            return {"error": "Baseline model not available"}
        result["model"] = "baseline"
    elif model_choice == "keyword":
        result = predict_with_keywords(text)
    else:
        result = predict_with_hybrid(text)
        if result is not None:
            pass
        else:
            result = predict_with_baseline(text)
            if result is not None:
                result["model"] = "baseline"
            else:
                result = predict_with_keywords(text)

    result = attach_explanation(result, text)
    result.update(
        {
            "title": article_data.get("title", ""),
            "scraper_method": article_data.get("method", ""),
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "full_text": text,
        }
    )
    mname = str(result.get("model", "unknown"))
    bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))
    _stats["url_predictions"] += 1
    return result


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "TRUEVERSE",
        "baseline_loaded": baseline_model is not None,
        "hybrid_loaded": hybrid_model is not None,
    }


@app.get("/metrics")
def metrics():
    return load_metrics()


@app.get("/analytics/usage")
def analytics_usage():
    return {
        "totals": {
            "predictions": _stats["predictions_total"],
            "url_runs": _stats["url_predictions"],
        },
        "by_model": _stats["by_model"],
        "by_verdict_category": _stats["by_verdict"],
    }
