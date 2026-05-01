from langdetect import detect


def detect_language(text: str) -> str:
    sample = (text or "").strip()
    if not sample:
        return "unknown"
    try:
        code = detect(sample[:800])
        if code.startswith("hi"):
            return "hi"
        if code.startswith("en"):
            return "en"
        return code
    except Exception:
        return "unknown"


def pick_model_for_language(language_code: str, model_choice: str) -> tuple[str, str]:
    """
    Returns (effective_model_choice, language_model_name).
    We route Hindi to a dedicated marker so UI can show language model intent.
    """
    if language_code == "hi":
        # Keep same classifier fallback for now, but expose routing intent.
        return model_choice, "muril-intended"
    return model_choice, "english-default"
