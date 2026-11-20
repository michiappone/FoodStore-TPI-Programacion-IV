from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schemas import UserPublic
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos, CambioEstado, EstadoPedido
from .service import (PedidoService, PedidoNoEncontrado, PedidoAjeno,
                      ProductoNoEncontrado, ReglaPedidoInvalida)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def safe(call):
    try:
        return call()
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(404, str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(403, str(exc)) from exc
    except ReglaPedidoInvalida as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post('', status_code=201, response_model=PedidoRead)
def crear(data: PedidoCreate, user: Annotated[UserPublic, Depends(get_current_active_user)],
          service: Annotated[PedidoService, Depends(get_pedido_service)]):
    return safe(lambda: service.crear(data, user))


@router.get('', response_model=PedidosPaginados)
def listar(user: Annotated[UserPublic, Depends(get_current_active_user)],
           service: Annotated[PedidoService, Depends(get_pedido_service)],
           skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), estado: EstadoPedido | None = None):
    return service.listar(user, skip, limit, estado)


# Importante: declarar /resumen ANTES de /{id}.
@router.get('/resumen', response_model=ResumenPedidos)
def resumen(_: Annotated[UserPublic, Depends(require_role(['admin']))],
            service: Annotated[PedidoService, Depends(get_pedido_service)]):
    return service.resumen()


@router.get('/{id}', response_model=PedidoRead)
def obtener(id: int, user: Annotated[UserPublic, Depends(get_current_active_user)],
            service: Annotated[PedidoService, Depends(get_pedido_service)]):
    return safe(lambda: service.obtener(id, user))


@router.patch('/{id}/estado', response_model=PedidoRead)
def cambiar_estado(id: int, data: CambioEstado, _: Annotated[UserPublic, Depends(require_role(['admin']))],
                   service: Annotated[PedidoService, Depends(get_pedido_service)]):
    return safe(lambda: service.cambiar_estado_admin(id, data.estado))


@router.patch('/{id}/cancelar', response_model=PedidoRead)
def cancelar(id: int, user: Annotated[UserPublic, Depends(get_current_active_user)],
             service: Annotated[PedidoService, Depends(get_pedido_service)]):
    return safe(lambda: service.cancelar_propietario(id, user))
