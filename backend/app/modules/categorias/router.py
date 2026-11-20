from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from .service import CategoriaService, CategoriaNoEncontrada, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix='/categorias', tags=['Categorías'])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get('', response_model=list[CategoriaRead])
def listar(service: Annotated[CategoriaService, Depends(get_categoria_service)]):
    return service.listar()


@router.get('/{id}', response_model=CategoriaRead)
def obtener(id: int, service: Annotated[CategoriaService, Depends(get_categoria_service)]):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc


@router.post('', status_code=201, response_model=CategoriaRead)
def crear(data: CategoriaCreate, _: Annotated[UserPublic, Depends(require_role(['admin']))],
          service: Annotated[CategoriaService, Depends(get_categoria_service)]):
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(409, str(exc)) from exc


@router.put('/{id}', response_model=CategoriaRead)
def actualizar(id: int, data: CategoriaUpdate, _: Annotated[UserPublic, Depends(require_role(['admin']))],
               service: Annotated[CategoriaService, Depends(get_categoria_service)]):
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(409, str(exc)) from exc


@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def eliminar(id: int, _: Annotated[UserPublic, Depends(require_role(['admin']))],
             service: Annotated[CategoriaService, Depends(get_categoria_service)]):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc
