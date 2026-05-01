import re

try:
    import spacy
except Exception:
    spacy = None


_NLP = None


def _get_nlp():
    global _NLP
    if _NLP is not None:
        return _NLP
    if spacy is None:
        return None
    try:
        _NLP = spacy.load("en_core_web_sm")
    except Exception:
        _NLP = spacy.blank("en")
        if "sentencizer" not in _NLP.pipe_names:
            _NLP.add_pipe("sentencizer")
    return _NLP


def split_claim_sentences(text: str, max_sentences: int = 18) -> list:
    cleaned = " ".join((text or "").split()).strip()
    if not cleaned:
        return []

    nlp = _get_nlp()
    chunks = []
    if nlp is not None:
        doc = nlp(cleaned)
        chunks = [s.text.strip() for s in doc.sents]
    else:
        chunks = re.split(r"(?<=[.!?])\s+", cleaned)

    out = []
    seen = set()
    for sent in chunks:
        s = sent.strip()
        if len(s) < 25:
            continue
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(s[:360])
        if len(out) >= max_sentences:
            break
    return out


def _severity(label: str, confidence: float) -> str:
    l = (label or "").lower()
    if l == "fake":
        return "high" if confidence >= 0.7 else "medium"
    if l == "uncertain":
        return "medium"
    return "safe" if confidence >= 0.6 else "medium"


def analyze_sentence_claims(text: str, predict_for_text, model_choice: str = "auto") -> list:
    items = []
    for sent in split_claim_sentences(text):
        pred = predict_for_text(sent, model_choice)
        if not isinstance(pred, dict) or pred.get("error"):
            continue
        conf = float(pred.get("confidence") or 0.0)
        label = str(pred.get("label") or "Uncertain")
        items.append(
            {
                "sentence": sent,
                "label": label,
                "confidence": round(conf, 3),
                "severity": _severity(label, conf),
                "confidence_pct": int(round(conf * 100)),
            }
        )
    return items
