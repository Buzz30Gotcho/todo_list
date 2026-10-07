# 📝 Todo List — Projet Docker

Application de liste de tâches **full CRUD**, conteneurisée avec Docker.
Thème sombre (noir & vert), interface fluide et responsive.

## 🧱 Architecture

| Service        | Techno                         | Port local | Dockerfile                    |
| -------------- | ------------------------------ | ---------- | ----------------------------- |
| `db`           | PostgreSQL 16                  | interne    | image officielle              |
| `backend`      | Python · FastAPI · SQLAlchemy  | **8001**   | simple                        |
| `frontend-js`  | **JavaScript** (vanilla)       | **8080**   | **simple** (nginx, sans build) |
| `frontend-ts`  | **Vue 3** (TypeScript)         | **8081**   | **multi-stage** (Node → nginx) |

Une contrainte respectée : un front en **JavaScript**, un front en
**TypeScript**. Les deux sont servis par **nginx** et proxifient `/api/` vers le
backend FastAPI — donc **aucun problème de CORS** et aucune URL à configurer.

> **Tout l'intérêt pédagogique est dans la différence des deux Dockerfiles :**
>
> - Le front **JavaScript** n'a **pas besoin de compilation** : le navigateur
>   lit directement le `.js`. Son Dockerfile est donc **minimal, en un seul
>   stage** — nginx copie les fichiers statiques tels quels.
> - Le front **TypeScript** doit être **compilé** (`vue-tsc --noEmit &&
>   vite build`) : d'où un Dockerfile **multi-stage**. L'étape de build (Node,
>   `node_modules`, compilateur) est jetée ; seule l'image nginx légère
>   contenant le `dist/` final est conservée.

## 🚀 Lancer le projet

Pré-requis : **Docker** + **Docker Compose**.

```bash
docker compose up --build
```

Puis ouvrir :

- 🟢 Front **JavaScript** → http://localhost:8080
- 🔵 Front **TypeScript** → http://localhost:8081
- ⚙️ API (docs Swagger)  → http://localhost:8001/docs

Pour tout arrêter :

```bash
docker compose down          # garde les données
docker compose down -v       # supprime aussi la base PostgreSQL
```

## 🔌 API REST (CRUD)

Base : `http://localhost:8001`

| Méthode  | Route           | Description               |
| -------- | --------------- | ------------------------- |
| `GET`    | `/todos`        | Liste toutes les tâches   |
| `POST`   | `/todos`        | Crée une tâche            |
| `GET`    | `/todos/{id}`   | Récupère une tâche        |
| `PUT`    | `/todos/{id}`   | Met à jour une tâche      |
| `DELETE` | `/todos/{id}`   | Supprime une tâche        |

Exemple :

```bash
curl -X POST http://localhost:8001/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Apprendre Docker", "description": "Multi-stage build"}'
```

## 📁 Structure

```
todolist/
├── docker-compose.yml
├── backend/            # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   └── Dockerfile
├── frontend-js/        # JavaScript vanilla — Dockerfile simple (1 stage)
│   ├── public/         # index.html, app.js, styles.css (servis tels quels)
│   ├── nginx.conf
│   └── Dockerfile
└── frontend-ts/        # Vue 3 + TypeScript — Dockerfile multi-stage
    ├── src/            # App.vue, main.ts, api.ts, types.ts
    ├── nginx.conf
    └── Dockerfile
```

## 🛠️ Développement sans Docker (optionnel)

**Backend**

```bash
cd backend
pip install -r requirements.txt
# base locale requise, ex :
export DATABASE_URL=postgresql://todo:todo@localhost:5432/todolist
uvicorn app.main:app --reload
```

**Front JavaScript** (`frontend-js`) — aucune install, aucun build :

```bash
cd frontend-js/public
python3 -m http.server 5173   # ou n'importe quel serveur statique
```

**Front TypeScript** (`frontend-ts`) — Vue 3 + Vite :

```bash
cd frontend-ts
npm install
npm run dev      # http://localhost:5173
```

> Hors Docker, pense à ajuster le proxy `/api` (ou à pointer directement vers
> `http://localhost:8001`), car ici c'est nginx qui assure ce proxy.
