import os
from typing import Optional

from pymongo import MongoClient


_client: Optional[MongoClient] = None
_db = None


def get_db():
    global _client, _db
    if _db is not None:
        return _db
    uri = os.environ.get("MONGO_URI", "").strip()
    db_name = os.environ.get("MONGO_DB_NAME", "trueverse")
    if not uri:
        return None
    _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    _db = _client[db_name]
    return _db


def is_db_ready() -> bool:
    db = get_db()
    if db is None:
        return False
    try:
        db.command("ping")
        return True
    except Exception:
        return False
