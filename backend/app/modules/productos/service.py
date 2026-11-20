from .models import Producto
from .schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from .unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, id: int) -> Producto:
        producto = uow.productos.get_by_id(id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado('Producto no encontrado')
        return producto

    @staticmethod
    def _categoria_valida(uow: ProductoUnitOfWork, id: int) -> None:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada o inactiva')

    def listar(self, skip: int, limit: int, search: str | None,
               categoria_id: int | None, disponible: bool | None) -> ProductosPaginados:
        with self.uow as uow:
            total, products = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in products])

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_valida(uow, data.categoria_id)
            product = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(product)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self._activo(uow, id)
            changes = data.model_dump(exclude_unset=True, exclude_none=True)
            if 'categoria_id' in changes:
                self._categoria_valida(uow, changes['categoria_id'])
            for key, value in changes.items():
                setattr(product, key, value)
            uow.session.add(product)
            uow.session.flush()
            if 'categoria_id' in changes:
                uow.session.expire(product, ['categoria'])
            return ProductoRead.model_validate(product)

    def cambiar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self._activo(uow, id)
            product.stock = data.stock
            product.disponible = data.disponible
            uow.session.add(product)
            uow.session.flush()
            return ProductoRead.model_validate(product)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            product = self._activo(uow, id)
            product.activo = False
            uow.session.add(product)
