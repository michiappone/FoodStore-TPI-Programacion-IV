from typing import Generic, TypeVar
from sqlmodel import SQLModel, Session, select

T = TypeVar('T', bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()  # No confirma la transacción: solo asigna los IDs.
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
