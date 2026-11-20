from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_auth_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
