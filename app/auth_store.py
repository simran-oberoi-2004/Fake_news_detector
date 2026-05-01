import base64
import hashlib
import hmac
import os
import time
from typing import Optional

import jwt

from db import get_db


JWT_SECRET = os.environ.get("JWT_SECRET", "change_me_in_production")
JWT_ALGO = "HS256"
JWT_TTL_SECONDS = int(os.environ.get("JWT_TTL_SECONDS", "604800"))  # 7 days


def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt_b64, dig_b64 = encoded.split("$", 1)
        salt = base64.b64decode(salt_b64.encode())
        expected = base64.b64decode(dig_b64.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def make_token(user_id: str, email: str) -> str:
    now = int(time.time())
    payload = {"sub": user_id, "email": email, "iat": now, "exp": now + JWT_TTL_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def parse_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])


def create_user(email: str, password: str):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    users = db["users"]
    if users.find_one({"email": email.lower()}):
        return {"error": "Email already registered"}
    encoded = hash_password(password)
    row = {"email": email.lower(), "password_hash": encoded, "created_at": int(time.time())}
    res = users.insert_one(row)
    token = make_token(str(res.inserted_id), email.lower())
    return {"token": token, "user": {"id": str(res.inserted_id), "email": email.lower()}}


def login_user(email: str, password: str):
    db = get_db()
    if db is None:
        return {"error": "Database not configured. Set MONGO_URI."}
    users = db["users"]
    row = users.find_one({"email": email.lower()})
    if not row or not verify_password(password, row.get("password_hash", "")):
        return {"error": "Invalid email or password"}
    token = make_token(str(row["_id"]), row["email"])
    return {"token": token, "user": {"id": str(row["_id"]), "email": row["email"]}}
