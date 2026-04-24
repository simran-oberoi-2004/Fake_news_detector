"""
Train baseline (TF–IDF + Logistic) and hybrid (BERT [CLS] + Random Forest) on LIAR.
Optimizations: bigram features, (optional) C grid search, batched BERT, deeper RF, real test metrics.
"""
import json
import os
import pickle
from datetime import datetime, timezone

import numpy as np
import torch
from tqdm import tqdm
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import GridSearchCV
from transformers import BertModel, BertTokenizer

from data import load_liar_dataset, preprocess_liar

_MODELS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
_METRICS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_metrics.json")

def _print_report(name: str, y_true, y_pred) -> dict:
    acc = float(accuracy_score(y_true, y_pred))
    f1w = float(f1_score(y_true, y_pred, average="weighted"))
    print(f"\n=== {name} — test set (no inflated metrics) ===")
    print(f"Accuracy: {acc:.4f}  |  F1 (weighted): {f1w:.4f}\n")
    print(classification_report(y_true, y_pred, target_names=["Fake(0)", "Real(1)"]))
    return {"accuracy": acc, "f1_weighted": f1w}


def _update_metrics_file(updates: dict) -> None:
    """Merge evaluation into model_metrics.json for API/frontend."""
    data = {}
    if os.path.exists(_METRICS):
        try:
            with open(_METRICS, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Warning: could not read model_metrics.json: {e}")
    data["last_training"] = datetime.now(timezone.utc).isoformat()
    data["test_eval"] = data.get("test_eval", {}) | updates.get("test_eval", {})
    if "models" not in data:
        data["models"] = {}
    for key, m in updates.get("models", {}).items():
        data["models"].setdefault(key, {})
        data["models"][key] = {**data["models"][key], **m}
    try:
        with open(_METRICS, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Wrote evaluation summary to {_METRICS}")
    except Exception as e:
        print(f"Warning: could not write model_metrics.json: {e}")


def train_baseline():
    print("Training baseline (TF–IDF + tuned LogisticRegression)...")
    os.makedirs(_MODELS, exist_ok=True)

    train_df = preprocess_liar(load_liar_dataset("../liar_dataset/train.tsv"))
    test_df = preprocess_liar(load_liar_dataset("../liar_dataset/test.tsv"))
    y_train, y_test = train_df["binary_label"], test_df["binary_label"]

    vectorizer = TfidfVectorizer(
        max_features=20_000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.92,
        sublinear_tf=True,
        stop_words="english",
    )
    X_train = vectorizer.fit_transform(train_df["statement"])
    X_test = vectorizer.transform(test_df["statement"])

    # Small grid: robust on LIAR-size data
    pipe = LogisticRegression(
        solver="saga",
        class_weight="balanced",
        max_iter=4_000,
        random_state=42,
    )
    grid = {
        "C": [0.1, 0.25, 0.4, 0.65, 1.0, 1.5, 2.0],
    }
    print("Running GridSearchCV on C (3-fold) — a few minutes...")
    search = GridSearchCV(
        pipe,
        grid,
        cv=3,
        scoring="f1_weighted",
        n_jobs=-1,
        refit=True,
    )
    search.fit(X_train, y_train)
    model = search.best_estimator_
    print(f"Best C = {search.best_params_['C']:.3f}  (CV F1 ≈ {search.best_score_:.4f})")

    with open(os.path.join(_MODELS, "baseline_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(_MODELS, "vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
    print("Baseline model + vectorizer saved")

    y_pred = model.predict(X_test)
    stats = _print_report("Baseline", y_test, y_pred)
    _update_metrics_file(
        {
            "test_eval": {"baseline": stats},
            "models": {
                "baseline": {
                    "name": "TF–IDF + Logistic (tuned)",
                    "approx_accuracy": stats["accuracy"],
                    "f1": stats["f1_weighted"],
                }
            },
        }
    )
    return stats


def get_bert_embeddings_batched(
    texts: list,
    tokenizer,
    model: BertModel,
    batch_size: int = 32,
    max_length: int = 256,
    desc: str = "BERT",
) -> np.ndarray:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()
    n = len(texts)
    if n == 0:
        return np.empty((0, 768), dtype=np.float32)
    n_batches = (n + batch_size - 1) // batch_size
    all_emb = []
    for i in tqdm(
        range(0, n, batch_size),
        desc=desc,
        total=n_batches,
        unit="batch",
    ):
        batch = texts[i : i + batch_size]
        with torch.no_grad():
            enc = tokenizer(
                batch,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=max_length,
            )
            enc = {k: v.to(device) for k, v in enc.items()}
            out = model(**enc)
            cls = out.last_hidden_state[:, 0, :].cpu().numpy()
            all_emb.append(cls)
    return np.vstack(all_emb) if all_emb else np.empty((0, 768), dtype=np.float32)


def train_hybrid():
    print("Training hybrid (BERT [CLS] + Random Forest)...")
    os.makedirs(_MODELS, exist_ok=True)

    train_df = preprocess_liar(load_liar_dataset("../liar_dataset/train.tsv"))
    test_df = preprocess_liar(load_liar_dataset("../liar_dataset/test.tsv"))

    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    bert_model = BertModel.from_pretrained("bert-base-uncased")
    if torch.cuda.is_available():
        bert_model = bert_model.to(torch.device("cuda"))

    dev = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"
    n_tr, n_te = len(train_df), len(test_df)
    print(
        f"Extracting BERT embeddings (max len 256, batch 32) on {dev}…\n"
        f"  Train: {n_tr} statements → { (n_tr + 31) // 32} batches. "
        f"Test: {n_te} statements. "
        f"On CPU this often takes 30–120+ minutes total; on GPU, much less.\n"
        f"  Watch the progress bars — it is not frozen while batches advance."
    )
    X_train = get_bert_embeddings_batched(
        list(train_df["statement"]),
        tokenizer,
        bert_model,
        batch_size=32,
        max_length=256,
        desc="BERT train",
    )
    X_test = get_bert_embeddings_batched(
        list(test_df["statement"]),
        tokenizer,
        bert_model,
        batch_size=32,
        max_length=256,
        desc="BERT test",
    )
    y_train, y_test = train_df["binary_label"].values, test_df["binary_label"].values

    # Stronger head than default RF: more estimators, depth, regularize leaves
    rf_model = RandomForestClassifier(
        n_estimators=400,
        max_depth=64,
        min_samples_leaf=2,
        min_samples_split=4,
        max_features="sqrt",
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    print("Fitting Random Forest on embeddings...")
    rf_model.fit(X_train, y_train)

    with open(os.path.join(_MODELS, "hybrid_model.pkl"), "wb") as f:
        pickle.dump(rf_model, f)
    tokenizer.save_pretrained(os.path.join(_MODELS, "bert_tokenizer"))
    bert_model.cpu()
    bert_model.save_pretrained(os.path.join(_MODELS, "bert_embedder"))
    print("Hybrid (RF + BERT files) saved")

    y_pred = rf_model.predict(X_test)
    stats = _print_report("Hybrid (BERT+RF)", y_test, y_pred)
    _update_metrics_file(
        {
            "test_eval": {"hybrid": stats},
            "models": {
                "hybrid": {
                    "name": "BERT + Random Forest",
                    "approx_accuracy": stats["accuracy"],
                    "f1": stats["f1_weighted"],
                }
            },
        }
    )
    return stats


if __name__ == "__main__":
    train_baseline()
    train_hybrid()
