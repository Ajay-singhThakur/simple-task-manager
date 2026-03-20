# Simple Task Manager (REST API + UI + MongoDB Atlas)

This project provides:
- A REST API for task CRUD + completion toggle
- A simple frontend UI (Google Font styling) served by the backend

## Run

### 1) Configure MongoDB Atlas

You need a MongoDB Atlas connection string.

- Create an Atlas cluster
- Create a database user + password
- Add your IP to **Network Access** (or allow `0.0.0.0/0` for quick testing)
- Copy your connection string (URI)

Put it in an environment variable:
- `MONGODB_URI`

Example format:
- `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbName>?retryWrites=true&w=majority`

You can see a template in `backend/.env.example`.

### 2) Install + start

From the project root:

1. `cd backend`
2. `npm install`
3. Set env var (PowerShell example):
   - `$env:MONGODB_URI="mongodb+srv://..."`
4. Start:
   - `npm start`

Optional (recommended for local):
- create `backend/.env` using `backend/.env.example`

Open in your browser:
- `http://localhost:3000`

## Data Model

Each task has:
- `id` (string)
- `title` (string, required; must not be empty)
- `description` (string; optional)
- `status` (`pending` or `completed`)
- `created_at` (ISO string)
- `updated_at` (ISO string)

Storage: MongoDB (Atlas)

## API Endpoints

All endpoints are under `/api/tasks`.

### List tasks

`GET /api/tasks`

Response:
- `{ "tasks": [ ... ] }`

### Create task

`POST /api/tasks`

Body:
```json
{ "title": "Pay rent", "description": "April" }
```

Validation:
- `title` must be a non-empty string

Response:
- `201 { "task": { ... } }`

### Update task

`PUT /api/tasks/:id`

Body:
```json
{ "title": "Pay rent", "description": "April", "status": "pending" }
```

Notes:
- `status` is optional; if omitted, the existing status is kept.
- `title` must be non-empty.

### Mark completed / pending

`PATCH /api/tasks/:id/status`

Body:
```json
{ "status": "completed" }
```

### Delete task

`DELETE /api/tasks/:id`

Response:
- `{ "deleted": { ...task } }`

## Quick curl Examples

Create:
```bash
curl -X POST http://localhost:3000/api/tasks ^
  -H "Content-Type: application/json" ^
  -d "{ \"title\": \"Test task\", \"description\": \"Demo\" }"
```

List:
```bash
curl http://localhost:3000/api/tasks
```

Mark completed:
```bash
curl -X PATCH http://localhost:3000/api/tasks/<id>/status ^
  -H "Content-Type: application/json" ^
  -d "{ \"status\": \"completed\" }"
```

## Deploy (Render or Railway)

This is a single Node.js service (API + static frontend) so it deploys as one web service.

### Environment variables to set

- `MONGODB_URI`: your MongoDB Atlas connection string
- `PORT`: provided automatically by most hosts (do not hardcode)

### Render (recommended)

1. Push this project to GitHub
2. In Render: **New +** → **Web Service**
3. Select your repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add env var:
   - `MONGODB_URI` = your Atlas URI
6. Deploy, then open the Render URL (UI is at `/`)

### Railway

1. Push to GitHub
2. In Railway: **New Project** → **Deploy from GitHub repo**
3. Set service root to `backend` (or configure a start command inside `backend`)
4. Add variable:
   - `MONGODB_URI`
5. Deploy, then open the Railway URL

## Deploy backend on Vercel (Serverless)

This repo includes `backend/api/index.js` + `backend/vercel.json` so Vercel can run the Express app as a serverless function.

### Steps

1. Push to GitHub
2. In Vercel: **Add New** → **Project** → import your repo
3. In Vercel Project Settings → set **Root Directory** to `backend`
4. In Vercel Project Settings → **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
5. Deploy

Your app will be available at:
- `/` (UI)
- `/api/tasks` (API)

