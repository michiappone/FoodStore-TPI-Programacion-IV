from sqlmodel import Field, Relationship, SQLModel


class Categoria(SQLModel, table=True):
    __tablename__ = 'categoria'
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True)
    descripcion: str = ''
    activo: bool = Field(default=True)

    productos: list['Producto'] = Relationship(back_populates='categoria')
