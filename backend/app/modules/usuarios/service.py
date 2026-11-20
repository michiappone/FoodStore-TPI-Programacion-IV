from fastapi import HTTPException
from sqlmodel import select
from app.core.security import hash_password, verify_password, create_access_token
from .models import Usuario
from .schemas import UserCreate, UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        username, email = data.username.strip(), str(data.email).lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(username) or uow.usuarios.get_by_email(email):
                raise HTTPException(409, 'El nombre de usuario o email ya está registrado')
            user = uow.usuarios.add(Usuario(username=username, full_name=data.full_name.strip(),
                                            email=email, hashed_password=hash_password(data.password), role='user'))
            return UserPublic.model_validate(user)

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(401, 'Credenciales incorrectas')
            if user.disabled:
                raise HTTPException(400, 'Cuenta de usuario desactivada')
            return create_access_token(user.username)

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.session.exec(select(Usuario)).all()]

    def cambiar_estado(self, user_id: int, activo: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise HTTPException(404, 'Usuario no encontrado')
            if not activo and actor_id == user_id:
                raise HTTPException(400, 'No podés desactivarte a vos mismo')
            user.disabled = not activo
            uow.session.add(user)
            uow.session.flush()
            return UserPublic.model_validate(user)
