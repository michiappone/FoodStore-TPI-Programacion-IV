from datetime import datetime
from pydantic import EmailStr, field_validator
from sqlmodel import SQLModel, Field


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=80)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def validar_bcrypt(cls, password: str) -> str:
        if len(password.encode('utf-8')) > 72:
            raise ValueError('La contraseña debe tener hasta 72 bytes')
        return password


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    disabled: bool
    created_at: datetime
