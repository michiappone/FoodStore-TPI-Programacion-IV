from datetime import datetime, timezone
from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Usuario(SQLModel, table=True):
    __tablename__ = 'usuario'
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default='user')
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)

    pedidos: list['Pedido'] = Relationship(back_populates='usuario')
