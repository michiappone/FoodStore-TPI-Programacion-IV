from sqlmodel import SQLModel, Session, create_engine
from app.core.config import get_settings

engine = create_engine(
    get_settings().DATABASE_URL,
    connect_args={'check_same_thread': False} if get_settings().DATABASE_URL.startswith('sqlite') else {},
    pool_pre_ping=True,
)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Se importan las cinco tablas para registrar sus relaciones antes de create_all.
    from app.modules.usuarios.models import Usuario  # noqa: F401
    from app.modules.categorias.models import Categoria  # noqa: F401
    from app.modules.productos.models import Producto  # noqa: F401
    from app.modules.pedidos.models import Pedido, DetallePedido  # noqa: F401
    SQLModel.metadata.create_all(engine)
