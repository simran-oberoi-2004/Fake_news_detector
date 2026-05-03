import os
import sys
from typing import Optional

from sklearn import base

# Support `uvicorn app.api:app` from repo root: load scraper/ and models next to this file, not the shell CWD
_APP_DIR = os.path.dirname(os.path.abspath(__file__))
if _APP_DIR not in sys.path:
    sys.path.insert(0, _APP_DIR)
_MODELS_DIR = os.path.join(_APP_DIR, "models")

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_APP_DIR, ".env"), override=True)
except ImportError:
    pass

from fastapi import FastAPI, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
import pickle
import json
import re
import fitz
import requests
from scraper import scrape_article
from sentence_claims import analyze_sentence_claims
from auth_store import create_user, login_user, parse_token
from result_store import save_analysis, list_history, delete_history, get_share_result
from language_router import detect_language, pick_model_for_language
from known_facts import check_known_facts

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


class AuthRequest(BaseModel):
    email: str
    password: str


class ShareCreateRequest(BaseModel):
    source_type: str = "text"
    input: str = ""
    result: dict = {}

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
GOOGLE_FACTCHECK_ENDPOINT = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

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


def predict_for_text(text: str, model_choice: str):
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
    return result


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    chunks = []
    for page in doc:
        chunks.append(page.get_text("text"))
    doc.close()
    text = "\n".join(chunks).strip()
    return text


def extract_key_claims(text: str, max_claims: int = 5) -> list:
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    claims = []
    seen = set()
    for raw in parts:
        c = " ".join((raw or "").split()).strip()
        if len(c) < 10:
            continue
        key = c.lower()
        if key in seen:
            continue
        seen.add(key)
        claims.append(c[:280])
        if len(claims) >= max_claims:
            break
    return claims


def fetch_google_fact_checks(claims: list) -> list:
    api_key = os.environ.get("GOOGLE_FACTCHECK_API_KEY", "").strip()

    print("API KEY LOADED:", api_key[:5])
    print("Calling Google Fact Check API...")

    if not api_key:
        return []

    results = []

    for claim in claims:
        try:
            params = {
                "query": claim,
                "languageCode": "en",
                "pageSize": 3
            }

            response = requests.get(
                GOOGLE_FACTCHECK_ENDPOINT,
                params=params,
                headers={"X-Goog-Api-Key": api_key},
                timeout=5
            )

            if response.status_code != 200:
                continue

            data = response.json()

            for item in data.get("claims", []):
                for review in item.get("claimReview", []):
                    results.append({
                        "text": item.get("text"),
                        "source_name": review.get("publisher", {}).get("name"),
                        "rating": review.get("textualRating"),
                        "url": review.get("url")
                    })

        except Exception as e:
            print("Fact check API error:", e)
            continue

    return results

    out = []
    for claim in claims:
        try:
            resp = requests.get(
                GOOGLE_FACTCHECK_ENDPOINT,
                params={"query": claim, "languageCode": "en", "key": api_key},
                timeout=8,
            )
            if resp.status_code != 200:
                continue
            body = resp.json() or {}
            for item in body.get("claims", [])[:2]:
                reviews = item.get("claimReview", []) or []
                if not reviews:
                    continue
                review = reviews[0]
                out.append(
                    {
                        "query_claim": claim,
                        "matched_claim": item.get("text", ""),
                        "source_name": review.get("publisher", {}).get("name", "Unknown"),
                        "rating": review.get("textualRating", "Unrated"),
                        "url": review.get("url", ""),
                    }
                )
        except Exception:
            continue

    # Deduplicate by URL while preserving order.
    uniq = []
    seen_urls = set()
    for item in out:
        u = item.get("url") or ""
        if u and u in seen_urls:
            continue
        if u:
            seen_urls.add(u)
        uniq.append(item)
    return uniq[:8]


def attach_fact_checks(base: dict, text: str) -> dict:
    claims = extract_key_claims(text, max_claims=5)
    fact_checks = fetch_google_fact_checks(claims)

    base["claims_extracted"] = claims
    base["fact_checks"] = fact_checks
    base["fact_check_provider"] = "google_fact_check_tools"
    base["fact_check_status"] = "configured" if os.environ.get("GOOGLE_FACTCHECK_API_KEY") else "disabled_no_api_key"

    # 🔥 SAFE HYBRID OVERRIDE LOGIC
    if fact_checks:
        false_hits = 0
        true_hits = 0

        for fc in fact_checks:
            rating = (fc.get("rating") or "").lower()

            # strong false signals
            if any(w in rating for w in ["false", "fake", "incorrect"]):
                false_hits += 1

            # strong true signals
            if any(w in rating for w in ["true", "correct", "accurate"]):
                true_hits += 1

        # apply override ONLY if strong agreement
        if false_hits >= 2 and false_hits > true_hits:
            base["risk"] = "High"
            base["action"] = "Flag Content"
            base["label"] = "Fake"
            base["confidence"] = 0.9
            base["model"] = "hybrid_api_override"
            base["override_reason"] = "Multiple trusted fact-checks marked this claim as false"

        elif true_hits >= 2 and true_hits > false_hits:
            base["risk"] = "Low"
            base["action"] = "Allow"
            base["label"] = "Real"
            base["confidence"] = 0.9
            base["model"] = "hybrid_api_override"
            base["override_reason"] = "Multiple trusted fact-checks verified this claim"

    return base


def attach_sentence_claims(base: dict, text: str, model_choice: str) -> dict:
    base["sentence_claims"] = analyze_sentence_claims(text, predict_for_text, model_choice)
    return base


def auth_user_from_header(authorization: Optional[str]) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    try:
        return parse_token(token)
    except Exception:
        return None


def maybe_attach_user_storage(result: dict, source_type: str, input_value: str, auth_header: Optional[str]) -> dict:
    user = auth_user_from_header(auth_header)
    if not user:
        return result
    saved = save_analysis(user_id=str(user.get("sub")), source_type=source_type, input_value=input_value, result=result)
    if saved.get("share_id"):
        result["share_id"] = saved["share_id"]
    return result


@app.post("/predict")
def predict(request: TextRequest, authorization: Optional[str] = Header(default=None)):
    text = request.text.strip()
    detected_language = detect_language(text)
    model_choice, language_model = pick_model_for_language(detected_language, request.model)
    if not text:
        return {"error": "Empty text provided"}
    
    known = check_known_facts(text)

    if known:
        result = {
            "label": known["label"],
            "confidence": known["confidence"],
            "model": "known_facts_layer",
            "risk": "Low" if known["label"] == "Real" else "High",
            "action": "Allow" if known["label"] == "Real" else "Flag Content",
            "fact_source": known["source"],
            "fact_explanation": known["explanation"],
            "fact_last_updated": known["last_updated"],
        }

        result = attach_explanation(result, text)
        result = attach_sentence_claims(result, text, model_choice)
        result["detected_language"] = detected_language
        result["language_model"] = language_model

        mname = str(result.get("model", "unknown"))
        bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))

        return maybe_attach_user_storage(result, "text", text[:1200], authorization)    

    result = predict_for_text(text, model_choice)
    if result.get("error"):
        return result

    result = attach_explanation(result, text)
    result = attach_fact_checks(result, text)
    result = attach_sentence_claims(result, text, model_choice)
    result["detected_language"] = detected_language
    result["language_model"] = language_model
    mname = str(result.get("model", "unknown"))
    bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))
    return maybe_attach_user_storage(result, "text", text[:1200], authorization)


@app.post("/predict_url")
def predict_url(request: URLRequest, authorization: Optional[str] = Header(default=None)):
    url = request.url.strip()
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
    detected_language = detect_language(text)
    model_choice, language_model = pick_model_for_language(detected_language, request.model)

    result = predict_for_text(text, model_choice)
    if result.get("error"):
        return result

    result = attach_explanation(result, text)
    result = attach_fact_checks(result, text)
    result = attach_sentence_claims(result, text, model_choice)
    result.update(
        {
            "title": article_data.get("title", ""),
            "scraper_method": article_data.get("method", ""),
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "full_text": text,
            "detected_language": detected_language,
            "language_model": language_model,
        }
    )
    mname = str(result.get("model", "unknown"))
    bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))
    _stats["url_predictions"] += 1
    return maybe_attach_user_storage(result, "url", url, authorization)


@app.post("/extract_pdf_text")
async def extract_pdf_text(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return {"error": "Please upload a .pdf file"}

    try:
        payload = await file.read()
        text = extract_text_from_pdf_bytes(payload)
    except Exception as e:
        return {"error": f"Failed to read PDF: {str(e)}"}

    if not text:
        return {"error": "No extractable text found in this PDF"}

    return {
        "filename": file.filename,
        "text_preview": text[:1500],
        "full_text": text[:15000],
        "char_count": len(text),
    }


@app.post("/predict_pdf")
async def predict_pdf(
    file: UploadFile = File(...),
    model: str = Form("auto"),
    authorization: Optional[str] = Header(default=None),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return {"error": "Please upload a .pdf file"}

    try:
        payload = await file.read()
        text = extract_text_from_pdf_bytes(payload)
    except Exception as e:
        return {"error": f"Failed to read PDF: {str(e)}"}

    if not text:
        return {"error": "No extractable text found in this PDF"}

    detected_language = detect_language(text)
    model_choice, language_model = pick_model_for_language(detected_language, model)
    result = predict_for_text(text, model_choice)
    if result.get("error"):
        return result

    result = attach_explanation(result, text)
    result = attach_fact_checks(result, text)
    result = attach_sentence_claims(result, text, model_choice)
    result.update(
        {
            "title": file.filename,
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "full_text": text[:15000],
            "source_type": "pdf",
            "detected_language": detected_language,
            "language_model": language_model,
        }
    )
    mname = str(result.get("model", "unknown"))
    bump_stats(mname, result.get("verdict", {}).get("key", "unknown"))
    return maybe_attach_user_storage(result, "file", file.filename or "pdf", authorization)


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


@app.post("/auth/signup")
def auth_signup(req: AuthRequest):
    email = (req.email or "").strip().lower()
    password = req.password or ""
    if not email or "@" not in email:
        return {"error": "Valid email required"}
    if len(password) < 6:
        return {"error": "Password must be at least 6 characters"}
    return create_user(email, password)


@app.post("/auth/login")
def auth_login(req: AuthRequest):
    email = (req.email or "").strip().lower()
    password = req.password or ""
    if not email or not password:
        return {"error": "Email and password are required"}
    return login_user(email, password)


@app.get("/auth/me")
def auth_me(authorization: Optional[str] = Header(default=None)):
    user = auth_user_from_header(authorization)
    if not user:
        return {"error": "Unauthorized"}
    return {"user": {"id": user.get("sub"), "email": user.get("email")}}


@app.get("/history")
def history(
    authorization: Optional[str] = Header(default=None),
    date_from: Optional[int] = None,
    verdict: Optional[str] = None,
    min_confidence: Optional[float] = None,
):
    user = auth_user_from_header(authorization)
    if not user:
        return {"error": "Unauthorized"}
    return list_history(str(user.get("sub")), date_from=date_from, verdict=verdict, min_conf=min_confidence)


@app.delete("/history")
def history_delete(authorization: Optional[str] = Header(default=None)):
    user = auth_user_from_header(authorization)
    if not user:
        return {"error": "Unauthorized"}
    return delete_history(str(user.get("sub")))


@app.post("/share/create")
def share_create(req: ShareCreateRequest):
    out = save_analysis(
        user_id="public",
        source_type=req.source_type or "text",
        input_value=req.input or "",
        result=req.result or {},
    )
    if out.get("error"):
        return out
    return {"share_id": out["share_id"]}


@app.get("/result/{share_id}")
def share_result(share_id: str):
    return get_share_result(share_id)
