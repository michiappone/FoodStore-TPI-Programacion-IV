from typing import Annotated
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str:
        token = request.cookies.get('access_token')
        if not token:
            raise HTTPException(401, 'No autenticado', headers={'WWW-Authenticate': 'Bearer'})
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl='/api/v1/auth/token')


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    username = decode_access_token(token)
    if not username:
        raise HTTPException(401, 'Sesión inválida o vencida', headers={'WWW-Authenticate': 'Bearer'})
    with UsuarioUnitOfWork() as uow:
        user = uow.usuarios.get_by_username(username)
        if user is None:
            raise HTTPException(401, 'Sesión inválida o vencida')
        return UserPublic.model_validate(user)


def get_current_active_user(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    if user.disabled:
        raise HTTPException(400, 'Cuenta de usuario desactivada')
    return user


def require_role(roles: list[str]):
    def verify(user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(403, 'Permisos insuficientes')
        return user
    return verify
