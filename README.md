# Lavandería — Plataforma en microservicios

Plataforma de lavandería con arquitectura **microservicios** (Spring Boot + JWT) y **frontend Angular 21**.
Lista para ejecutar localmente con Docker Compose y desplegable en Render desde GitHub.

---

## 1. Descripción del proyecto

Sistema completo para gestión de un negocio de lavandería:

- **Autenticación** propia con JWT y roles `ADMIN` / `USER`.
- **Catálogo de servicios** (lavado básico, premium, planchado, lavado en seco).
- **Órdenes** que un cliente crea sobre los servicios disponibles, con estados `PENDIENTE → EN_PROCESO → LISTO → ENTREGADO`.
- **Frontend SPA** con vistas separadas para administrador y cliente.

## 2. Tecnologías

| Capa            | Tecnología                                                      |
|-----------------|------------------------------------------------------------------|
| Backend         | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA       |
| Tokens          | JJWT 0.12 (HMAC-SHA256, secreto compartido entre microservicios) |
| Base de datos   | MySQL 8 (auth) y PostgreSQL 16 (servicios y órdenes)             |
| Inter-servicios | WebClient (HTTP entre order-service y laundry-service)           |
| Frontend        | Angular 21 (standalone components + signals)                     |
| Empaquetado     | Docker multi-stage, nginx para servir el frontend                |
| Orquestación    | Docker Compose para local, render.yaml para producción           |

## 3. Arquitectura

```
┌──────────────────┐
│   Frontend       │  Angular 21 (nginx) :4200
│  (SPA + JWT)     │──────┬──────────────┬─────────────────┐
└──────────────────┘      │              │                 │
                          ▼              ▼                 ▼
                ┌─────────────────┐ ┌────────────┐ ┌────────────────┐
                │ auth-service    │ │ laundry-   │ │ order-service  │
                │ Spring Boot     │ │ service    │ │ Spring Boot    │
                │ :8081  (JWT)    │ │ :8082      │ │ :8083          │
                └────────┬────────┘ └─────┬──────┘ └────┬───────┬───┘
                         │                │             │       │
                         ▼                ▼             ▼       ▼ HTTP
                   ┌──────────┐     ┌─────────────┐  ┌─────────────┐
                   │  MySQL   │     │ PostgreSQL  │  │ PostgreSQL  │
                   │  :3307   │     │   :5432     │  │   :5432     │
                   └──────────┘     │ (laundry)   │  │  (orders)   │
                                    └─────────────┘  └─────────────┘
```

Cada microservicio:
- es un proyecto Spring Boot independiente con su propio `pom.xml`, `Dockerfile` y `application.yml`,
- tiene su propio puerto y su propia conexión a base de datos,
- valida los JWT de forma stateless usando un **secreto compartido** (`JWT_SECRET`) que también firma `auth-service`.

`order-service` consulta `laundry-service` vía HTTP (WebClient) para obtener precio y datos del servicio al crear una orden.

```
laundry-platform/
├── backend/
│   ├── auth-service/        # Spring Boot + MySQL + JWT (puerto 8081)
│   ├── laundry-service/     # Spring Boot + PostgreSQL    (puerto 8082)
│   └── order-service/       # Spring Boot + PostgreSQL    (puerto 8083)
├── frontend/                # Angular 21 + nginx           (puerto 4200)
├── infra/postgres-init.sql  # Crea la BD de órdenes en Postgres
├── docker-compose.yml
├── render.yaml
├── .env.example
└── README.md
```

## 4. Ejecutar localmente

### 4.1 Con Docker Compose (recomendado)

Requisitos: Docker Desktop con Docker Compose v2.

```bash
cp .env.example .env
docker compose up --build
```

Servicios expuestos:

| Servicio        | URL                            |
|-----------------|--------------------------------|
| Frontend        | http://localhost:4200          |
| auth-service    | http://localhost:8081          |
| laundry-service | http://localhost:8082          |
| order-service   | http://localhost:8083          |
| MySQL           | localhost:3307 (host) / 3306 (red) |
| PostgreSQL      | localhost:5432                 |

> El puerto del host de MySQL es **3307** para evitar choques con un MySQL local. Dentro de la red de Docker el puerto sigue siendo `3306`.

Para parar:

```bash
docker compose down          # mantiene los volúmenes (datos)
docker compose down -v       # borra también los datos
```

### 4.2 Solo backend local (sin Docker)

Cada servicio se construye y corre por separado con Maven:

```bash
# Levanta MySQL y PostgreSQL como prefieras (Docker, instalación nativa…)

cd backend/auth-service
./mvnw spring-boot:run        # o: mvn spring-boot:run

cd backend/laundry-service
./mvnw spring-boot:run

cd backend/order-service
./mvnw spring-boot:run
```

Cada microservicio toma su configuración por defecto desde `src/main/resources/application.yml` y puedes sobreescribir con variables de entorno (ver sección Variables).

### 4.3 Solo frontend local (sin Docker)

```bash
cd frontend
npm install
npm start    # http://localhost:4200
```

Por defecto el frontend apunta a los backends en `http://localhost:8081/8082/8083` (ver `src/environments/environment.ts`).

## 5. Endpoints principales

Todos los endpoints, salvo `register`, `login` y `validate`, requieren `Authorization: Bearer <jwt>`.

### auth-service (puerto 8081)

| Método | Ruta              | Rol     | Descripción                                  |
|--------|-------------------|---------|----------------------------------------------|
| POST   | `/auth/register`  | público | Registra un usuario. `role` opcional (default USER). |
| POST   | `/auth/login`     | público | Devuelve `{ token, role, userId, ... }`.     |
| GET    | `/auth/me`        | auth    | Datos del usuario autenticado.               |
| POST   | `/auth/validate`  | público | Valida un JWT y devuelve sus claims.         |

### laundry-service (puerto 8082)

| Método | Ruta             | Rol           | Descripción                       |
|--------|------------------|---------------|------------------------------------|
| GET    | `/services`      | USER, ADMIN   | Lista todos los servicios. `?onlyActive=true` filtra activos. |
| GET    | `/services/{id}` | USER, ADMIN   | Detalle de un servicio.            |
| POST   | `/services`      | ADMIN         | Crea un servicio.                  |
| PUT    | `/services/{id}` | ADMIN         | Actualiza un servicio.             |
| DELETE | `/services/{id}` | ADMIN         | Elimina un servicio.               |

### order-service (puerto 8083)

| Método | Ruta                  | Rol         | Descripción                                            |
|--------|-----------------------|-------------|--------------------------------------------------------|
| GET    | `/orders`             | ADMIN       | Lista todas las órdenes.                               |
| GET    | `/orders/my-orders`   | USER, ADMIN | Lista las órdenes del usuario autenticado.             |
| GET    | `/orders/{id}`        | USER, ADMIN | Detalle (USER solo si la orden es suya).               |
| POST   | `/orders`             | USER, ADMIN | Crea orden. Body: `{ serviceId, quantity, notes? }`.   |
| PUT    | `/orders/{id}/status` | ADMIN       | Cambia estado. Body: `{ status }`.                     |
| DELETE | `/orders/{id}`        | USER, ADMIN | Borra orden propia (USER) o cualquiera (ADMIN).        |

### Pruebas rápidas con curl

```bash
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

curl -s http://localhost:8082/services -H "Authorization: Bearer $TOKEN"

curl -s -X POST http://localhost:8083/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":1,"quantity":2,"notes":"prueba"}'
```

## 6. Usuarios y datos de prueba

Al arrancar `auth-service` se crean dos usuarios (si no existen):

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| `admin` | `admin123` | ADMIN |
| `user`  | `user123`  | USER  |

`laundry-service` crea 4 servicios iniciales: **Lavado básico**, **Lavado premium**, **Planchado**, **Lavado en seco**.

`order-service` crea 2 órdenes de prueba para el usuario `user`.

## 7. Roles ADMIN y USER

- **ADMIN**:
  - Iniciar sesión.
  - CRUD completo de servicios de lavandería.
  - Ver todas las órdenes y cambiar su estado.
  - Eliminar cualquier orden.
- **USER**:
  - Registrarse e iniciar sesión.
  - Ver servicios activos.
  - Crear órdenes y consultar las suyas.
  - No puede tocar el catálogo ni órdenes ajenas.

La autorización se valida tanto en backend (Spring Security + `@PreAuthorize` y matchers por método HTTP) como en el frontend (route guards por rol).

## 8. Variables de entorno

| Variable                  | Servicio                | Descripción                                                |
|---------------------------|-------------------------|-------------------------------------------------------------|
| `PORT`                    | todos los backend       | Puerto donde escucha Spring Boot.                           |
| `SPRING_DATASOURCE_URL`   | todos los backend       | JDBC URL de la base de datos.                               |
| `SPRING_DATASOURCE_USERNAME` | "                    | Usuario BD.                                                 |
| `SPRING_DATASOURCE_PASSWORD` | "                    | Contraseña BD.                                              |
| `JPA_DDL_AUTO`            | todos los backend       | `update` (default), `validate`, `none`…                     |
| `JWT_SECRET`              | todos los backend       | **Mismo valor en los 3 servicios** (firma y validación).    |
| `JWT_EXPIRATION_MS`       | auth-service            | Duración del token (ms). Default 24h.                       |
| `CORS_ALLOWED_ORIGINS`    | todos los backend       | Orígenes permitidos (`*` o lista separada por coma).        |
| `LAUNDRY_SERVICE_URL`     | order-service           | URL pública/interna del laundry-service.                    |
| `SEED_ADMIN_USERNAME/PASSWORD` | auth-service       | Usuario admin inicial.                                      |
| `SEED_USER_USERNAME/PASSWORD`  | auth-service       | Usuario user inicial.                                       |
| `AUTH_API_URL`            | frontend                | URL pública del auth-service.                               |
| `LAUNDRY_API_URL`         | frontend                | URL pública del laundry-service.                            |
| `ORDER_API_URL`           | frontend                | URL pública del order-service.                              |

> Las variables del frontend se inyectan **en runtime** vía `env.template.js` → `env.js`, así que el contenedor sirve el mismo bundle en cualquier ambiente.

## 9. Despliegue en Render

Render permite desplegar este proyecto **directamente desde GitHub** usando el `render.yaml` incluido.

> **Limitación importante**: Render **no ofrece MySQL gestionado** en su plan gratuito. Para `auth-service` puedes usar un MySQL externo (PlanetScale, Aiven, Clever Cloud, Railway…) o adaptar el servicio a Postgres.

### 9.1 Pre-requisitos

1. Sube este repo a GitHub.
2. Crea cuenta en https://render.com y conéctala con tu GitHub.
3. (Opcional pero recomendado para `auth-service`) crea una BD MySQL externa y guarda su `JDBC URL`, usuario y contraseña.

### 9.2 Pasos (Blueprint con render.yaml)

1. En Render → **New** → **Blueprint** → selecciona el repo.
2. Render leerá `render.yaml` y mostrará los servicios:
   - `lavanderia-postgres` (DB)
   - `lavanderia-auth-service`
   - `lavanderia-laundry-service`
   - `lavanderia-order-service`
   - `lavanderia-frontend`
3. Confirma. Render comenzará a construir cada servicio con su `Dockerfile`.
4. Durante el primer deploy te pedirá completar las variables marcadas con `sync: false`. Configúralas así:

#### lavanderia-auth-service

| Variable                       | Valor                                                              |
|--------------------------------|---------------------------------------------------------------------|
| `SPRING_DATASOURCE_URL`        | `jdbc:mysql://HOST:3306/DB?useSSL=true&serverTimezone=UTC`          |
| `SPRING_DATASOURCE_USERNAME`   | usuario MySQL                                                       |
| `SPRING_DATASOURCE_PASSWORD`   | contraseña MySQL                                                    |
| `CORS_ALLOWED_ORIGINS`         | URL pública del frontend, ej: `https://lavanderia-frontend.onrender.com` |
| `SEED_ADMIN_PASSWORD`          | (elige una contraseña fuerte)                                       |
| `SEED_USER_PASSWORD`           | (elige una contraseña fuerte)                                       |

`JWT_SECRET` se genera automáticamente con `generateValue: true`. **Copia su valor**: lo necesitas idéntico en los otros dos backends.

#### lavanderia-laundry-service

| Variable               | Valor                                                                   |
|------------------------|--------------------------------------------------------------------------|
| `JWT_SECRET`           | el mismo que en auth-service                                            |
| `CORS_ALLOWED_ORIGINS` | URL pública del frontend                                                |

(Las variables `SPRING_DATASOURCE_*` se conectan automáticamente al Postgres de Render.)

#### lavanderia-order-service

| Variable               | Valor                                                                   |
|------------------------|--------------------------------------------------------------------------|
| `JWT_SECRET`           | el mismo que en auth-service                                            |
| `LAUNDRY_SERVICE_URL`  | URL pública del laundry-service, ej: `https://lavanderia-laundry-service.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | URL pública del frontend                                                |

#### lavanderia-frontend

| Variable           | Valor                                                                          |
|--------------------|---------------------------------------------------------------------------------|
| `AUTH_API_URL`     | `https://lavanderia-auth-service.onrender.com`                                  |
| `LAUNDRY_API_URL`  | `https://lavanderia-laundry-service.onrender.com`                               |
| `ORDER_API_URL`    | `https://lavanderia-order-service.onrender.com`                                 |

5. Tras configurar las variables, vuelve a desplegar (Manual Deploy → Deploy latest commit).

### 9.3 Configuración de puertos en Render

Render inyecta la variable `PORT` automáticamente. Nuestros `application.yml` ya leen `${PORT:NNNN}`, por lo que **no es necesario tocar nada**.

### 9.4 Conectar las bases de datos

- **PostgreSQL**: definido en `render.yaml` como `lavanderia-postgres`. Las variables `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` de `laundry-service` y `order-service` se llenan automáticamente con `fromDatabase`.
- **MySQL externo (auth-service)**:
  - **PlanetScale**: crea una base, copia la URL JDBC y usa SSL.
  - **Aiven**: 30 días gratis. Te da un host MySQL público con SSL.
  - **Clever Cloud**: free tier permanente.
  - Pega la `JDBC URL`, usuario y contraseña en las env vars del auth-service.

### 9.5 Cómo cambiar variables de entorno en Render

1. Render → tu servicio → pestaña **Environment**.
2. Edita o crea variables.
3. **Save changes**: Render redeploy automáticamente.

### 9.6 Despliegue desde GitHub (sin Blueprint)

Si prefieres crear cada servicio manualmente:

1. **New** → **Web Service** → conecta el repo.
2. Elige **Runtime: Docker**.
3. **Root Directory**: `backend/auth-service` (o el que toque).
4. Dockerfile path: `./Dockerfile`.
5. Repite para cada microservicio y para el frontend.
6. Crea un **PostgreSQL** (Render → New → PostgreSQL) y conéctalo.
7. Configura todas las variables de entorno listadas arriba.

### 9.7 Comandos Docker útiles

```bash
docker compose up --build              # Construye y levanta todo
docker compose up -d --build           # Igual, en background
docker compose logs -f auth-service    # Ver logs en vivo
docker compose ps                      # Estado de los contenedores
docker compose down -v                 # Para todo y borra volúmenes
docker build -t lavanderia/auth-service:latest backend/auth-service
docker build -t lavanderia/frontend:latest frontend
```

## 10. Seguridad

- Contraseñas hasheadas con BCrypt (`auth-service`).
- JWT firmado con HMAC-SHA256 y secreto compartido en variable `JWT_SECRET`.
- Cada microservicio valida el JWT de manera stateless.
- Spring Security restringe rutas:
  - `services` POST/PUT/DELETE → `ROLE_ADMIN`.
  - `orders` GET (todas) y `orders/{id}/status` → `ROLE_ADMIN`.
  - `orders/{id}` y `orders/{id}` DELETE comprueban que el dueño coincida (o el rol sea ADMIN).
- CORS configurable por servicio con `CORS_ALLOWED_ORIGINS`.

## 11. URLs esperadas

Local:

- Frontend: http://localhost:4200
- auth-service: http://localhost:8081
- laundry-service: http://localhost:8082
- order-service: http://localhost:8083

Render (ejemplos):

- Frontend: https://lavanderia-frontend.onrender.com
- auth-service: https://lavanderia-auth-service.onrender.com
- laundry-service: https://lavanderia-laundry-service.onrender.com
- order-service: https://lavanderia-order-service.onrender.com

## 12. Solución de problemas

| Problema | Solución |
|----------|----------|
| `Illegal base64 character` al iniciar un backend | El `JWT_SECRET` debe tener al menos 32 caracteres. El proyecto ya tolera secretos no-base64. |
| `Failed to connect to laundry-service` desde order-service | Revisa `LAUNDRY_SERVICE_URL` y que el laundry-service esté arriba. |
| CORS error en el navegador | Pon la URL exacta del frontend en `CORS_ALLOWED_ORIGINS` de los 3 backends. |
| Render: "Web service is sleeping" | El plan free duerme tras 15 min sin tráfico. Es normal, despierta con la primera request. |
| `port 3306 already in use` | Tienes un MySQL local. El compose usa `3307` en host para evitarlo. |

---

Hecho para uso educativo / proyectos de demostración. Cambia los secretos antes de un despliegue real.
