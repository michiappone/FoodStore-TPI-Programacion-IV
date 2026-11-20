from .models import Categoria
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, id))

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada')
        return categoria

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = data.nombre.strip()
            if len(nombre) < 2 or uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado('Nombre de categoría inválido o duplicado')
            c = uow.categorias.add(Categoria(nombre=nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(c)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            c = self._activa(uow, id)
            changes = data.model_dump(exclude_unset=True, exclude_none=True)
            if 'nombre' in changes:
                nombre = changes['nombre'].strip()
                existing = uow.categorias.get_by_nombre(nombre)
                if len(nombre) < 2 or existing and existing.id != id:
                    raise NombreDuplicado('Nombre de categoría inválido o duplicado')
                changes['nombre'] = nombre
            for key, value in changes.items():
                setattr(c, key, value)
            uow.session.add(c)
            uow.session.flush()
            return CategoriaRead.model_validate(c)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            c = self._activa(uow, id)
            c.activo = False
            uow.session.add(c)
