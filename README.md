# 📝 Todo List — Projet Docker

Application de liste de tâches **full CRUD**, conteneurisée avec Docker.
Deux frontends indépendants (JavaScript pur et TypeScript pur) partagent la
même API REST FastAPI et la même base PostgreSQL.

## 🧱 Architecture

| Service | Techno | Port local | Dockerfile |
| --- | --- | --- | --- |
| `db` | PostgreSQL 16 | interne | image officielle |
| `backend` | Python · FastAPI · SQLAlchemy | **8001** | simple |
| `frontend-js` | **JavaScript pur** (vanilla) | **8083** | **simple** (nginx, sans build) |
| `frontend-ts` | **TypeScript pur** (sans framework) | **8081** | **multi-stage** (Node → nginx) |

Les deux frontends sont servis par **nginx** et proxifient `/api/` vers le
backend FastAPI — donc **aucun problème de CORS** et aucune URL à configurer.

> **L'intérêt pédagogique est dans la différence des deux Dockerfiles :**
>
> - Le front **JavaScript** n'a **pas besoin de compilation** : le navigateur
>   lit directement le `.js`. Son Dockerfile est **minimal, en un seul stage**
>   — nginx copie les fichiers statiques tels quels.
> - Le front **TypeScript** doit être **compilé** (`tsc`) : d'où un Dockerfile
>   **multi-stage**. L'étape de build (Node, `node_modules`, compilateur) est
>   jetée ; seule l'image nginx légère contenant le `dist/` final est conservée.

## 🚀 Lancer le projet

Pré-requis : **Docker** + **Docker Compose**.

Créer le fichier `.env` local à partir du modèle, puis adapter les valeurs si
besoin. Le fichier `.env` contient les identifiants utilisés par PostgreSQL et
le backend ; il est ignoré par Git.

```bash
cp .env.example .env
docker compose up --build -d
```

Puis ouvrir :

- 🟢 Front JavaScript → http://localhost:8083
- 🔵 Front TypeScript → http://localhost:8081
- ⚙️ API (docs Swagger) → http://localhost:8001/docs

Pour tout arrêter :

```bash
docker compose down          # garde les données
docker compose down -v       # supprime aussi la base PostgreSQL
```

## 🔌 API REST (CRUD)

Base : http://localhost:8001

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/todos` | Liste toutes les tâches |
| POST | `/todos` | Crée une tâche |
| GET | `/todos/{id}` | Récupère une tâche |
| PUT | `/todos/{id}` | Met à jour une tâche |
| DELETE | `/todos/{id}` | Supprime une tâche |

Exemple :

```bash
curl -X POST http://localhost:8001/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Apprendre Docker", "description": "Multi-stage build"}'
```

## 📁 Structure

```text
todolist/
├── docker-compose.yml
├── .env.example          # modèle de configuration locale (sans secret)
├── .github/
│   └── workflows/
│       └── ci.yml        # CI GitHub Actions
├── backend_fastapi/      # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   └── Dockerfile
├── frontend-js/          # JavaScript pur — Dockerfile simple (1 stage)
│   ├── public/
│   │   ├── index.html
│   │   ├── app.js        # utilise logic.js
│   │   ├── logic.js      # logique pure (filtrage, stats…)
│   │   ├── logic.test.js # 17 tests node:test
│   │   └── styles.css
│   ├── package.json      # uniquement pour `npm test`
│   ├── nginx.conf
│   └── Dockerfile
└── frontend-ts/          # TypeScript pur — Dockerfile multi-stage
    ├── src/
    │   ├── main.ts       # utilise logic.ts
    │   ├── logic.ts      # logique pure (filtrage, stats…)
    │   ├── logic.test.ts # 17 tests node:test
    │   ├── api.ts
    │   ├── types.ts
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.build.json
    ├── nginx.conf
    └── Dockerfile
```

## 🛠️ Développement sans Docker (optionnel)

### Backend

```bash
cd backend_fastapi
pip install -r requirements.txt
# Base locale requise, par exemple :
export DATABASE_URL=postgresql://todo:todo@localhost:5432/todolist
uvicorn app.main:app --reload
```

### Front JavaScript (`frontend-js`) — aucune install, aucun build

```bash
cd frontend-js/public
python3 -m http.server 5173
```

### Front TypeScript (`frontend-ts`) — compilation avec `tsc`

```bash
cd frontend-ts
npm install
npm run build   # compile src/*.ts → dist/*.js
npx serve dist  # ou python3 -m http.server dans dist/
```

## 🧪 Tests

Le projet est testé à 3 niveaux.

### Backend (`pytest`)

```bash
docker compose exec backend python -m pytest -v
```

2 tests : `test_todo_crud` (CRUD complet) et `test_rejects_blank_title`
(validation).

- Base SQLite temporaire (isolée de PostgreSQL) via `conftest.py`.
- Nettoyage entre chaque test.

### Frontend JS (`node:test`)

```bash
cd frontend-js
npm test
```

17 tests répartis en 5 groupes : `filterTodos`, `countStats`,
`formatSubtitle`, `isValidTitle`, `emptyMessage`.

Logique pure extraite dans `logic.js`, testée sans DOM.

### Frontend TS (`node:test`)

```bash
cd frontend-ts
npm test
```

17 tests identiques à la version JS, sur `logic.ts`.

Nécessite `@types/node` (installé via `npm install`).

**Total : 36 tests** (2 backend + 17 JS + 17 TS).

## 🔄 Intégration continue (GitHub Actions)

Fichier : `.github/workflows/ci.yml`

La CI se lance sur chaque push et pull request. Elle contient 3 jobs :

| Job | Ce qu'il fait |
| --- | --- |
| `backend-tests` | Installe Python 3.12, lance `python -m pytest -v` |
| `frontend-tests` | Matrice `frontend-js` / `frontend-ts`, lance `npm ci && npm test` |
| `docker-build` | `docker compose config --quiet` + `docker compose build` |

Ce que la CI ne fait pas : elle ne démarre pas les conteneurs
(`docker compose up`). Elle valide la configuration et construit les images,
ce qui suffit à détecter les erreurs de Dockerfile, de dépendances et de
compilation.

## 🧠 Choix techniques

### Pourquoi deux frontends ?

- `frontend-js` : JavaScript pur, sans build, servi tel quel par nginx.
  Démontre qu'un front peut être minimal.
- `frontend-ts` : TypeScript pur, compilé avec `tsc`, sans framework
  (pas de Vue, pas de React, pas d'Angular). Démontre qu'on peut faire du
  typage fort sans framework.

Les deux partagent la même logique (`logic.js` / `logic.ts`) et la même
UI (`styles.css` / `index.css`), pour garantir un rendu identique.

### Pourquoi extraire `logic.js` / `logic.ts` ?

`app.js` et `main.ts` touchent au DOM (`document.getElementById`, etc.).
Ils ne sont donc pas testables dans Node sans `jsdom` (lourd). En
extrayant la logique pure (filtrage, statistiques, validation), on peut la
tester sans DOM avec `node:test`, sans dépendance supplémentaire.

### Pourquoi `tsconfig.build.json` ?

`tsconfig.json` compile tout (y compris `logic.test.ts`), ce qui nécessite
`@types/node`. Mais le build de production n'a pas besoin des tests. On utilise
donc `tsconfig.build.json` (qui exclut `*.test.ts`) pour le build Docker,
et `tsconfig.json` (qui inclut tout) pour `npm test`.

## 📦 Migration Vue → TypeScript pur

Le front `frontend-ts` était initialement en Vue 3 + Vite. Il a été migré
vers TypeScript pur (sans framework, sans Vite) :

| Avant (Vue + Vite) | Après (TS pur) |
| --- | --- |
| `App.vue` (SFC) | `main.ts` (DOM natif) |
| `createApp(App).mount('#app')` | `render()` + `addEventListener` |
| `vite.config.ts` | `tsconfig.json` + `tsconfig.build.json` |
| `vite build` | `tsc` |
| `vue-tsc` | `tsc` |
| `import './index.css'` | `<link href="./src/index.css">` |

Le build produit `dist/*.js` + `dist/index.html` + `dist/src/index.css`,
servis par nginx.

## 🐳 Commandes Docker utiles

```bash
# Lancer tout
docker compose up --build -d

# Voir l'état
docker compose ps

# Logs d'un service
docker compose logs -f backend

# Tests backend
docker compose exec backend python -m pytest -v

# Rebuild un seul service
docker compose up --build -d frontend-ts

# Arrêter
docker compose down

# Tout nettoyer (efface la DB)
docker compose down -v
```
