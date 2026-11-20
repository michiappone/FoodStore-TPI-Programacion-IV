"""Seed idempotente de la consigna: python -m app.db.seed"""
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork

CATEGORIAS = [
    ('Pizzas', 'Pizzas recién horneadas'),
    ('Hamburguesas', 'Hamburguesas con ingredientes frescos'),
    ('Bebidas', 'Para acompañar tus comidas'),
]
PRODUCTOS = [
    ('Pizza mozzarella', 'Pizzas', 12500, 25),
    ('Pizza napolitana', 'Pizzas', 14300, 18),
    ('Pizza especial', 'Pizzas', 15800, 20),
    ('Hamburguesa clásica', 'Hamburguesas', 10900, 30),
    ('Hamburguesa doble', 'Hamburguesas', 13500, 19),
    ('Hamburguesa veggie', 'Hamburguesas', 11900, 12),
    ('Gaseosa 500 ml', 'Bebidas', 2900, 50),
    ('Agua mineral', 'Bebidas', 2200, 50),
]


def main() -> None:
    create_all_tables()
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username('admin') is None:
            uow.usuarios.add(Usuario(username='admin', full_name='Administrador Food Store',
                                     email='admin@foodstore.example.com',
                                     hashed_password=hash_password('Admin1234!'), role='admin'))
            print('Creado administrador: admin / Admin1234!')
        else:
            print('Administrador existente; sin duplicar.')
    with ProductoUnitOfWork() as uow:
        for nombre, descripcion in CATEGORIAS:
            if uow.categorias.get_by_nombre(nombre) is None:
                uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
        categorias = {c.nombre: c.id for c in uow.categorias.get_all()}
        existing = {p.nombre for p in uow.productos.get_all()}
        for nombre, categoria, precio, stock in PRODUCTOS:
            if nombre not in existing:
                uow.productos.add(Producto(nombre=nombre, categoria_id=categorias[categoria],
                                           descripcion=f'{nombre} de Food Store',
                                           precio_base=precio, stock=stock, disponible=True))
    print('Seed completado (3 categorías y al menos 8 productos).')


if __name__ == '__main__':
    main()
