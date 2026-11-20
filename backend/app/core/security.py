from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)

def create_access_token(email: str) -> str:
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "type": "access", "exp": expires}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, get_settings().SECRET_KEY, algorithms=[get_settings().ALGORITHM])
        if payload.get("type") != "access":
            return None
        email = payload.get("sub")
        return email if isinstance(email, str) and email else None
    except JWTError:
        return None
