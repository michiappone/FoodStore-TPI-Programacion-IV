from typing import Annotated
from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import get_settings
from app.core.deps import get_current_active_user
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService
from .service import get_auth_service
from .schemas import Mensaje

router = APIRouter(prefix='/auth', tags=['Autenticación'])


@router.post('/register', response_model=UserPublic, status_code=201)
def registrar(data: UserCreate, service: Annotated[UsuarioService, Depends(get_auth_service)]):
    return service.registrar(data)


@router.post('/token', response_model=Mensaje)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response,
          service: Annotated[UsuarioService, Depends(get_auth_service)]):
    token = service.autenticar(form.username, form.password)
    cfg = get_settings()
    response.set_cookie('access_token', token, httponly=True, secure=cfg.COOKIE_SECURE,
                        samesite='lax', max_age=cfg.ACCESS_TOKEN_EXPIRE_MINUTES * 60, path='/')
    return Mensaje(message='Login exitoso')


@router.post('/logout', response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie('access_token', path='/', httponly=True, secure=get_settings().COOKIE_SECURE, samesite='lax')
    return Mensaje(message='Sesión cerrada')


@router.get('/me', response_model=UserPublic)
def perfil(user: Annotated[UserPublic, Depends(get_current_active_user)]):
    return user
