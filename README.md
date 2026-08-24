# ColoCare

Lifestyle support for colorectal cancer survivors. This school-project MVP provides authenticated role workspaces, lifestyle assessments, model-led wellness suggestions, educational resources, and weekly goals.

## Run it

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001` and its health check is at `/health`.

Roles are deliberately split at sign-up: oncologists and caregivers open the end-user workspace; patients and relatives open the clinical-user workspace. PostgreSQL holds users, assessments, goals, and recommendation results. The Kysely migration/code-generation commands are `pnpm --filter @colocare/api migrate` and `pnpm --filter @colocare/api db:codegen`.

Patient onboarding captures date of birth, sex, treatment status/history, current survivorship symptoms, and informed consent before the lifestyle assessment begins.

The Python KNN service is a demonstration decision-support model (`apps/recommender`). Its bundled dataset is illustrative only; it must be replaced with approved, de-identified, clinically validated data before any real-world clinical use.

Run migrations manually inside the API container when you choose:

```bash
docker compose exec api pnpm migrate
docker compose exec api pnpm db:codegen
```

## Docker

Development (live reload):

```bash
docker compose up --build
```

Open `http://localhost:5173`. Each app has its own `Dev.Dockerfile` and production `Dockerfile`. To build the production images and serve the web app on port 8080:

```bash
docker compose -f compose.prod.yaml up --build
```

The API deliberately uses seeded in-memory data so the demo works without database configuration. Data resets when the API restarts. Recommendations are educational decision support and never medical diagnosis, prescriptions, or emergency advice.
