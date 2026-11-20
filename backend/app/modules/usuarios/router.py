from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix='/admin/usuarios', tags=['Administración de usuarios'])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get('', response_model=list[UserPublic])
def listar(_: Annotated[UserPublic, Depends(require_role(['admin']))],
           service: Annotated[UsuarioService, Depends(get_usuario_service)]):
    return service.listar()


@router.post('/{id}/activar', response_model=UserPublic)
def activar(id: int, _: Annotated[UserPublic, Depends(require_role(['admin']))],
            service: Annotated[UsuarioService, Depends(get_usuario_service)]):
    return service.cambiar_estado(id, True, _.id)


@router.post('/{id}/desactivar', response_model=UserPublic)
def desactivar(id: int, _: Annotated[UserPublic, Depends(require_role(['admin']))],
               service: Annotated[UsuarioService, Depends(get_usuario_service)]):
    return service.cambiar_estado(id, False, _.id)
