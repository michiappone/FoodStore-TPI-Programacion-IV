from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def list_activas(self) -> list[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)).all())
