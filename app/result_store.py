import secrets
import time
from bson import ObjectId

from db import get_db


def _gen_share_id() -> str:
    return secrets.token_urlsafe(5).replace("-", "").replace("_", "")[:8]


def save_analysis(user_id: str, source_type: str, input_value: str, result: dict):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    share_id = _gen_share_id()
    row = {
        "user_id": user_id,
        "source_type": source_type,
        "input": (input_value or "")[:2000],
        "result": result,
        "share_id": share_id,
        "created_at": int(time.time()),
    }
    res = db["analysis_results"].insert_one(row)
    return {"id": str(res.inserted_id), "share_id": share_id}


def list_history(user_id: str, date_from=None, verdict=None, min_conf=None):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    q = {"user_id": user_id}
    if date_from is not None:
        q["created_at"] = {"$gte": int(date_from)}
    if verdict:
        q["result.verdict.key"] = verdict
    if min_conf is not None:
        q["result.confidence"] = {"$gte": float(min_conf)}
    rows = list(db["analysis_results"].find(q).sort("created_at", -1).limit(200))
    out = []
    for row in rows:
        out.append(
            {
                "id": str(row["_id"]),
                "t": row.get("created_at"),
                "kind": row.get("source_type", "text"),
                "input": row.get("input", ""),
                "result": row.get("result", {}),
                "share_id": row.get("share_id"),
            }
        )
    return {"items": out}


def delete_history(user_id: str):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    res = db["analysis_results"].delete_many({"user_id": user_id})
    return {"deleted": int(res.deleted_count)}


def get_share_result(share_id: str):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    row = db["analysis_results"].find_one({"share_id": share_id})
    if not row:
        return {"error": "Result not found"}
    return {
        "id": str(row["_id"]),
        "share_id": share_id,
        "kind": row.get("source_type", "text"),
        "input": row.get("input", ""),
        "result": row.get("result", {}),
        "created_at": row.get("created_at"),
    }


def get_analysis_by_id(user_id: str, analysis_id: str):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    try:
        row = db["analysis_results"].find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
    except Exception:
        return {"error": "Invalid analysis id"}
    if not row:
        return {"error": "Analysis not found"}
    return row
