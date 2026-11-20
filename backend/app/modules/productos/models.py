from sqlmodel import Field, Relationship, SQLModel


class Producto(SQLModel, table=True):
    __tablename__ = 'producto'
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key='categoria.id', index=True)
    nombre: str
    descripcion: str = ''
    precio_base: float = Field(ge=0)
    imagen_url: str = ''
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: 'Categoria' = Relationship(back_populates='productos')
    detalles: list['DetallePedido'] = Relationship(back_populates='producto')
