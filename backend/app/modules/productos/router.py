from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from .schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from .service import ProductoService, ProductoNoEncontrado, CategoriaNoEncontrada
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix='/productos', tags=['Productos'])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def safe(call):
    try:
        return call()
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(404, str(exc)) from exc


@router.get('', response_model=ProductosPaginados)
def listar(service: Annotated[ProductoService, Depends(get_producto_service)],
           skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
           search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get('/{id}', response_model=ProductoRead)
def obtener(id: int, service: Annotated[ProductoService, Depends(get_producto_service)]):
    return safe(lambda: service.obtener(id))


@router.post('', status_code=201, response_model=ProductoRead)
def crear(data: ProductoCreate, _: Annotated[UserPublic, Depends(require_role(['admin']))],
          service: Annotated[ProductoService, Depends(get_producto_service)]):
    return safe(lambda: service.crear(data))


@router.put('/{id}', response_model=ProductoRead)
def actualizar(id: int, data: ProductoUpdate, _: Annotated[UserPublic, Depends(require_role(['admin']))],
               service: Annotated[ProductoService, Depends(get_producto_service)]):
    return safe(lambda: service.actualizar(id, data))


@router.patch('/{id}/stock', response_model=ProductoRead)
def cambiar_stock(id: int, data: ProductoStockUpdate, _: Annotated[UserPublic, Depends(require_role(['admin']))],
                  service: Annotated[ProductoService, Depends(get_producto_service)]):
    return safe(lambda: service.cambiar_stock(id, data))


@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def eliminar(id: int, _: Annotated[UserPublic, Depends(require_role(['admin']))],
             service: Annotated[ProductoService, Depends(get_producto_service)]):
    return safe(lambda: service.eliminar(id))
