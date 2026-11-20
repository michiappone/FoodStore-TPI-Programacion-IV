"""Pruebas opcionales de contrato sobre SQLite (no reemplazan prueba en PostgreSQL).
Ejecución: pip install -r requirements-dev.txt && python -m pytest -q
"""
import os
import tempfile

# Aislar tests; nunca tocar la DB configurada para la aplicación.
fd, database_path = tempfile.mkstemp(suffix='.sqlite')
os.close(fd)
os.environ['DATABASE_URL'] = 'sqlite:///' + database_path
os.environ['SECRET_KEY'] = 'TEST_SECRET_KEY_SOLO_PARA_PRUEBAS_DE_AL_MENOS_32_CARACTERES'
os.environ['FRONTEND_ORIGIN'] = 'http://localhost:5173'

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.db.seed import main as seed  # noqa: E402


def login(client: TestClient, username: str, password: str) -> None:
    result = client.post('/api/v1/auth/token', data={'username': username, 'password': password})
    assert result.status_code == 200, result.text
    assert result.json() == {'message': 'Login exitoso'}
    assert 'httponly' in result.headers['set-cookie'].lower()


def test_flujo_integral():
    with TestClient(app) as client:
        seed()
        seed()  # Idempotencia.
        cats = client.get('/api/v1/categorias')
        assert cats.status_code == 200 and len(cats.json()) == 3
        catalogue = client.get('/api/v1/productos', params={'skip': 0, 'limit': 20}).json()
        assert catalogue['total'] == 8 and len(catalogue['items']) == 8
        producto = catalogue['items'][0]
        product_id = producto['id']
        stock_inicial = producto['stock']
        assert 'categoria' in producto and producto['categoria']['id'] == producto['categoria_id']
        assert client.post('/api/v1/productos', json={}).status_code == 401

        new_user = {'username': 'cliente1', 'full_name': 'Cliente Uno', 'email': 'cliente1@example.com', 'password': 'Secreto123!'}
        reg = client.post('/api/v1/auth/register', json=new_user)
        assert reg.status_code == 201 and reg.json()['role'] == 'user'
        assert 'hashed_password' not in reg.json()
        assert client.post('/api/v1/auth/register', json=new_user).status_code == 409
        login(client, 'cliente1', 'Secreto123!')
        assert client.get('/api/v1/auth/me').json()['username'] == 'cliente1'
        assert client.post('/api/v1/categorias', json={'nombre': 'Prueba'}).status_code == 403

        orden = {'items': [{'producto_id': product_id, 'cantidad': 2}],
                 'forma_pago': 'EFECTIVO', 'direccion_entrega': 'Calle 123, Córdoba'}
        creado = client.post('/api/v1/pedidos', json=orden)
        assert creado.status_code == 201, creado.text
        pedido = creado.json()
        assert pedido['estado'] == 'PENDIENTE'
        assert pedido['items'][0]['nombre_producto'] == producto['nombre']
        assert pedido['items'][0]['precio_unitario'] == producto['precio_base']
        assert pedido['total'] == 2 * producto['precio_base']
        assert client.get(f'/api/v1/productos/{product_id}').json()['stock'] == stock_inicial - 2
        assert client.get('/api/v1/pedidos').json()['total'] == 1
        assert client.patch(f"/api/v1/pedidos/{pedido['id']}/estado", json={'estado': 'ENTREGADO'}).status_code == 403

        duplicated = {**orden, 'items': [orden['items'][0], orden['items'][0]]}
        assert client.post('/api/v1/pedidos', json=duplicated).status_code == 400
        bad_stock = {**orden, 'items': [{'producto_id': product_id, 'cantidad': 1}, {'producto_id': catalogue['items'][1]['id'], 'cantidad': 9999}]}
        assert client.post('/api/v1/pedidos', json=bad_stock).status_code == 400
        assert client.get(f'/api/v1/productos/{product_id}').json()['stock'] == stock_inicial - 2
        assert client.post('/api/v1/pedidos', json={**orden, 'forma_pago': 'TARJETA'}).status_code == 422
        cancel = client.patch(f"/api/v1/pedidos/{pedido['id']}/cancelar")
        assert cancel.status_code == 200 and cancel.json()['estado'] == 'CANCELADO'
        assert client.get(f'/api/v1/productos/{product_id}').json()['stock'] == stock_inicial
        assert client.patch(f"/api/v1/pedidos/{pedido['id']}/cancelar").status_code == 400

        # Verificar dueño: otro usuario no puede consultar ni cancelar el pedido.
        client.post('/api/v1/auth/register', json={'username': 'cliente2', 'full_name': 'Cliente Dos',
                    'email': 'cliente2@example.com', 'password': 'Secreto123!'})
        login(client, 'cliente2', 'Secreto123!')
        assert client.get(f"/api/v1/pedidos/{pedido['id']}").status_code == 403
        assert client.patch(f"/api/v1/pedidos/{pedido['id']}/cancelar").status_code == 403

        # Admin: avance permitido, cancelación durante preparación y estado terminal.
        login(client, 'admin', 'Admin1234!')
        resumen = client.get('/api/v1/pedidos/resumen')
        assert resumen.status_code == 200 and resumen.json()['cancelados'] == 1
        assert client.patch(f"/api/v1/pedidos/{pedido['id']}/estado", json={'estado': 'ENTREGADO'}).status_code == 400
        usuarios = client.get('/api/v1/admin/usuarios').json()
        admin = next(x for x in usuarios if x['username'] == 'admin')
        user = next(x for x in usuarios if x['username'] == 'cliente1')
        assert client.post(f"/api/v1/admin/usuarios/{admin['id']}/desactivar").status_code == 400
        assert client.post(f"/api/v1/admin/usuarios/{user['id']}/desactivar").status_code == 200
        login_invalid = client.post('/api/v1/auth/token', data={'username': 'cliente1', 'password': 'Secreto123!'})
        assert login_invalid.status_code == 400
        assert client.post(f"/api/v1/admin/usuarios/{user['id']}/activar").status_code == 200
        assert client.post(f"/api/v1/admin/usuarios/{user['id']}/activar").status_code == 200
        category_id = cats.json()[0]['id']
        assert client.delete(f'/api/v1/categorias/{category_id}').status_code == 204
        assert client.get(f'/api/v1/categorias/{category_id}').status_code == 404
        # Dar de baja una categoría no oculta sus productos del catálogo.
        assert client.get(f'/api/v1/productos/{product_id}').status_code == 200
        assert client.get('/docs').status_code == 200
        assert client.get('/redoc').status_code == 200
        assert client.post('/api/v1/auth/logout').status_code == 200
        assert client.get('/api/v1/auth/me').status_code == 401
