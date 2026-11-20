from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_for_update(self, id: int) -> Producto | None:
        return self.session.exec(select(Producto).where(Producto.id == id).with_for_update()).first()

    def search(self, skip: int, limit: int, search: str | None = None,
               categoria_id: int | None = None, disponible: bool | None = None) -> tuple[int, list[Producto]]:
        filters = [Producto.activo == True]
        if search:
            filters.append(Producto.nombre.ilike(f'%{search}%'))
        if categoria_id is not None:
            filters.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filters.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*filters)).one()
        productos = self.session.exec(select(Producto).where(*filters)
                                      .options(selectinload(Producto.categoria))
                                      .order_by(Producto.id).offset(skip).limit(limit)).all()
        return int(total), list(productos)
