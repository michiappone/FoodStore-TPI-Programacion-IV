# FOOD STORE — Trabajo Práctico Integrador de Programación IV (UTN)

Proyecto Full Stack: **FastAPI + SQLModel + PostgreSQL** (backend) y **React 19 + TypeScript + Vite 7** (frontend). Construido a partir de los conceptos y componentes de los TP8 (Unit of Work), TP9 (seguridad JWT) y TP10 (estructura frontend por features), y adaptado al nuevo UML del TPI.

Durante la preparación se comprobaron en Windows el seed con PostgreSQL 18, los endpoints principales, las compras, cancelaciones, roles y stock, además de `pnpm build` y el recorrido en React. Estas comprobaciones corresponden al entorno de desarrollo utilizado; en otra computadora se debe ejecutar la instalación desde cero siguiendo estos pasos.

**Repositorio público de GitHub:** https://github.com/michiappone/FoodStore-TPI-Programacion-IV

**Video de demostración:** https://youtu.be/nmCsMoK7EY4

## Requisitos

- Python **3.11, 3.12 o 3.13** (la consigna recomienda este rango; no usar el Python 3.14 del TP anterior).
- PostgreSQL **15 o superior** (se recomienda PostgreSQL 18 si ya está instalado).
- Node.js **20.19 o superior**.
- **pnpm 9 o superior**: se puede instalar mediante `npm install -g pnpm@9`.
- Una terminal PowerShell en Windows, o equivalente en otros sistemas.

## 1. Preparar base de datos

En PostgreSQL crear una base vacía llamada `foodstore_tpi`. Ejemplo en `psql`:

```sql
CREATE DATABASE foodstore_tpi;
```

Si ya existe una base `foodstore_tpi` de un TP anterior con tablas diferentes, **no la reutilices sin respaldo**: los modelos y relaciones de este TPI son distintos. Se recomienda crear una nueva base vacía, por ejemplo `foodstore_tpi_nueva`, y cambiar su nombre en `DATABASE_URL`.

> Para probar rápidamente el backend también puede utilizarse SQLite mediante `DATABASE_URL=sqlite:///./foodstore.db` (permitido solo para desarrollo por el PDF), pero la entrega está diseñada para PostgreSQL.

## 2. Instalar e iniciar backend

Abrí una terminal dentro de la carpeta `backend/`.

**Windows PowerShell:**

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

**Linux/macOS:**

```bash
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Editar `backend/.env` y reemplazar:

- `DATABASE_URL` por tu usuario, contraseña, servidor y base de PostgreSQL.
- `SECRET_KEY` por una clave secreta aleatoria de **al menos 32 caracteres**.
- `FRONTEND_ORIGIN` si cambiás el puerto de Vite (valor por defecto `http://localhost:5173`).
- `COOKIE_SECURE=false` funciona en desarrollo HTTP local; en producción HTTPS debe ser `true` y configurar cookies/CORS según los orígenes utilizados.

Ejemplo de conexión PostgreSQL: `postgresql+psycopg2://postgres:TU_CONTRASENA@localhost:5432/foodstore_tpi`.

Luego, desde `backend/` con el entorno virtual activo:

```powershell
python -m app.db.seed
uvicorn app.main:app --reload
```

La primera orden registra las tablas, crea el administrador y carga el catálogo de ejemplo. Es **idempotente**: volver a ejecutarla no duplica categorías ni productos.

**Admin del seed** (solo desarrollo):

- Usuario: `admin`
- Contraseña: `Admin1234!`

Backend: `http://localhost:8000`  
Swagger: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`  
API: `http://localhost:8000/api/v1`

## 3. Instalar e iniciar frontend

Abrí **otra** terminal en `frontend/`:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
pnpm install
pnpm build
pnpm dev
```

**Linux/macOS:**

```bash
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

En `frontend/.env`, `VITE_API_URL=http://localhost:8000/api/v1` debe señalar al backend real. En el navegador abrir `http://localhost:5173`.

Las dos aplicaciones se ejecutan **al mismo tiempo** en terminales diferentes. Los archivos `.env` con contraseñas/secretos **no** se incluyen en el ZIP ni se suben a GitHub. Se debe crear un `.env` propio en cada instalación.

## 4. Funcionalidades y pantallas

**Sin sesión:** navegar catálogo, filtrar por categoría, buscar, recorrer páginas, armar el carrito, registrarse e ingresar. El carrito se guarda en el navegador con Zustand `persist`.

**Cliente autenticado (`user`):** finalizar compra con dirección, EFECTIVO/TRANSFERENCIA y notas; ver sus pedidos y cancelarlos cuando están PENDIENTE. Al cancelar se restituye el stock.

**Administrador (`admin`):** catálogo y carrito, resumen, ABM lógico de categorías/productos, modificación de stock y disponibilidad, ver y avanzar/cancelar pedidos, activar/desactivar usuarios. No puede desactivarse a sí mismo.

### Reglas importantes

- La autenticación JWT llega por cookie HttpOnly `access_token`, con duración de 30 minutos. **Nunca se expone el token en JSON ni se almacena en localStorage**.
- El frontend usa Axios `withCredentials: true`, TanStack Query para estado del servidor, TanStack Form para formularios, TanStack Table para tablas administrativas, Zustand para usuario y carrito, y React Router con `ProtectedRoute`.
- El backend comprueba siempre permisos y roles: **ocultar botones en React no es suficiente para autorizar**.
- Productos y categorías se eliminan lógicamente (`activo=false`). Desactivar una categoría **no oculta** sus productos ni libera el nombre único.
- Los pedidos no se editan ni se borran. Se cancelan o cambian estado según la máquina: `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`, terminales sin cambios.
- La creación y cancelación de pedidos usan **una única transacción**. Si una validación falla, Unit of Work ejecuta `rollback` y no queda descontado stock ni pedido parcial.
- Cada línea guarda nombre, precio unitario y subtotal propios; si cambia el catálogo, el pedido conserva su precio histórico.

## 5. Estructura del proyecto

```text
FoodStore_TPI/
├── README.md                         ← README oficial de la entrega
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── requirements-dev.txt          ← pruebas opcionales
│   ├── app/
│   │   ├── main.py                  ← FastAPI, CORS y routers /api/v1
│   │   ├── core/                    ← config, DB, JWT, deps, UoW y repositorio base
│   │   ├── modules/
│   │   │   ├── auth/                ← login, registro, logout y perfil
│   │   │   ├── usuarios/            ← ABM lógico y roles
│   │   │   ├── categorias/          ← Router, Service, UoW, Repo, Model, Schemas
│   │   │   ├── productos/           ← Router, Service, UoW, Repo, Model, Schemas
│   │   │   └── pedidos/             ← Router, Service, UoW, Repo, Model, Schemas
│   │   └── db/seed.py
│   └── tests/test_integracion.py    ← pruebas de contrato opcionales
└── frontend/
    ├── .env.example
    ├── package.json
    ├── src/
    │   ├── features/                ← auth, usuarios, categorias, productos, pedidos
    │   ├── shared/                  ← Axios, QueryClient, componentes, UI y layout
    │   ├── store/                   ← authStore, cartStore
    │   ├── routes/                  ← AppRouter, ProtectedRoute
    │   ├── App.tsx
    │   └── main.tsx
    └── vite.config.ts
```

## 6. Pruebas opcionales

El TPI no exige pruebas automatizadas, pero se incluye un conjunto opcional para verificar el contrato antes de entregar. Utiliza **SQLite temporal** para no tocar PostgreSQL ni una base anterior.

```powershell
# Desde backend/ y dentro de .venv
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

Las pruebas cubren seed idempotente, catálogo, roles, registro duplicado, cookie HttpOnly, pedido, stock, rollback, cancelación, permisos y estados. **También es indispensable probar manualmente el recorrido en PostgreSQL y React**.

## 7. Demostración y entrega

1. Registrar un usuario cliente e ingresar mostrando que la respuesta del login no contiene token, sino `Set-Cookie: access_token=...; HttpOnly`.
2. Recorrer el catálogo, buscar, filtrar y agregar productos al carrito. Refrescar el navegador para demostrar persistencia.
3. Confirmar un pedido con dirección y forma de pago. Mostrar la reducción del stock desde el administrador.
4. Ingresar como administrador `admin` y demostrar categorías, productos, stock, usuarios y resumen.
5. Avanzar un pedido de PENDIENTE a EN_PREPARACION y, si se desea, a ENTREGADO.
6. Cancelar otro pedido y mostrar la restitución de stock.
7. Mostrar en GitHub el repositorio público. Subir un video público **de 10 a 15 minutos**, con la cámara encendida al inicio, y pegar su link al principio de este README.
8. Comprimir el proyecto sin `node_modules`, `.venv`, `.env`, `__pycache__`, `dist` ni archivos de base de datos.

**No publicar datos de usuarios reales, credenciales de PostgreSQL ni la clave secreta de producción.**
