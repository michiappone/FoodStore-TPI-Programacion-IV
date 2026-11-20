from datetime import datetime, time
from .models import Pedido, DetallePedido
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import utc_now
from app.modules.usuarios.schemas import UserPublic


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ReglaPedidoInvalida(Exception):
    pass


class ProductoRepetido(ReglaPedidoInvalida):
    pass


class StockInsuficiente(ReglaPedidoInvalida):
    pass


class ProductoNoDisponible(ReglaPedidoInvalida):
    pass


class TransicionInvalida(ReglaPedidoInvalida):
    pass


# RN-02: los estados terminales nunca admiten transiciones.
TRANSICIONES = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _pedido(uow: PedidoUnitOfWork, id: int, bloquear: bool = False) -> Pedido:
        pedido = uow.pedidos.obtener_bloqueado(id) if bloquear else uow.pedidos.obtener_con_items(id)
        if pedido is None:
            raise PedidoNoEncontrado('Pedido no encontrado')
        return pedido

    @staticmethod
    def _as_read(pedido: Pedido) -> PedidoRead:
        return PedidoRead.model_validate(pedido)

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido('No puede repetirse un producto en el pedido')
            pedido = uow.pedidos.add(Pedido(usuario_id=usuario.id, forma_pago=data.forma_pago,
                                           direccion_entrega=data.direccion_entrega,
                                           notas=data.notas, total=0, estado='PENDIENTE'))
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado('Producto no encontrado o inactivo')
                if not producto.disponible:
                    raise ProductoNoDisponible(f'Producto no disponible: {producto.nombre}')
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f'Stock insuficiente: {producto.nombre}')
                producto.stock -= item.cantidad
                uow.session.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(pedido_id=pedido.id, producto_id=producto.id,
                                        cantidad=item.cantidad, nombre_producto=producto.nombre,
                                        precio_unitario=producto.precio_base, subtotal=subtotal)
                uow.session.add(detalle)
                total += subtotal
            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.expire(pedido, ['items'])
            return self._as_read(pedido)

    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            owner = None if usuario.role == 'admin' else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(skip, limit, owner, estado)
            return PedidosPaginados(total=total, items=[self._as_read(p) for p in pedidos])

    def obtener(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id)
            if usuario.role != 'admin' and pedido.usuario_id != usuario.id:
                raise PedidoAjeno('No podés consultar pedidos ajenos')
            return self._as_read(pedido)

    @staticmethod
    def _cambiar_estado(uow: PedidoUnitOfWork, pedido: Pedido, estado: str) -> PedidoRead:
        if estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida('Transición de estado no permitida')
        if estado == 'CANCELADO':
            for item in pedido.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado('Producto del pedido no encontrado')
                producto.stock += item.cantidad
                uow.session.add(producto)
        pedido.estado = estado
        pedido.updated_at = utc_now()
        uow.session.add(pedido)
        uow.session.flush()
        return PedidoRead.model_validate(pedido)

    def cambiar_estado_admin(self, id: int, estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id, bloquear=True)
            return self._cambiar_estado(uow, pedido, estado)

    def cancelar_propietario(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id, bloquear=True)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno('No podés cancelar pedidos ajenos')
            if pedido.estado != 'PENDIENTE':
                raise TransicionInvalida('Solo podés cancelar tus pedidos PENDIENTE')
            return self._cambiar_estado(uow, pedido, 'CANCELADO')

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            hoy = datetime.combine(utc_now().date(), time.min)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado('PENDIENTE'),
                en_preparacion=uow.pedidos.count_by_estado('EN_PREPARACION'),
                entregados=uow.pedidos.count_by_estado('ENTREGADO'),
                cancelados=uow.pedidos.count_by_estado('CANCELADO'),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
