from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def obtener_con_items(self, id: int) -> Pedido | None:
        return self.session.exec(select(Pedido).where(Pedido.id == id)
                                 .options(selectinload(Pedido.items))).first()

    def obtener_bloqueado(self, id: int) -> Pedido | None:
        # Evita cancelar dos veces en transacciones concurrentes (doble restitución).
        return self.session.exec(select(Pedido).where(Pedido.id == id)
                                 .with_for_update()
                                 .options(selectinload(Pedido.items))).first()

    def list_by_usuario(self, skip: int, limit: int, usuario_id: int | None,
                        estado: str | None) -> tuple[int, list[Pedido]]:
        filters = []
        if usuario_id is not None:
            filters.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filters.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filters)).one()
        rows = self.session.exec(select(Pedido).where(*filters)
                                 .options(selectinload(Pedido.items))
                                 .order_by(Pedido.created_at.desc(), Pedido.id.desc())
                                 .offset(skip).limit(limit)).all()
        return int(total), list(rows)

    def count_by_estado(self, estado: str) -> int:
        return int(self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.estado == estado)).one())

    def count_desde(self, inicio: datetime) -> int:
        return int(self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio)).one())

    def ingresos_entregados(self) -> float:
        return float(self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == 'ENTREGADO')).one())
