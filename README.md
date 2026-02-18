# Pokemon Team Builder

Full stack Pokemon team builder with:

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI + httpx
- Data persistence: in-memory cache only

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `GET /pokemon/search?q=<query>&limit=<1..20>&regions=<kanto,johto,...>`
- `POST /analyze` with body `{ "team": ["pikachu", "gengar"] }`
- `POST /suggestions?limit=<1..12>` with body `{ "team": ["pikachu", "gengar"], "regions": ["kanto", "johto"] }`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Default backend URL is `http://localhost:8000`.
Set `NEXT_PUBLIC_API_BASE_URL` if needed.
