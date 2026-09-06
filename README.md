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

Open `http://localhost:5173`. Each app has its own `Dev.Dockerfile` and production `Dockerfile`. `compose.prod.yml` is the production stack definition used by the VPS deployment.

## Deploy to a VPS

Pushing to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`. It builds and publishes one GHCR image for each monorepo service (`api`, `web`, and `recommender`), then the self-hosted runner on the VPS copies the production Compose file to the configured location, pulls the immutable commit-tagged images, runs API migrations, and starts the stack.

In the GitHub `production` environment, create a variable named `VPS_COMPOSE_FILE` with the full target path on the VPS, for example `/opt/colocare/compose.prod.yml`. Before the first deployment, create a `.env` file beside that Compose file with secrets that must persist between releases:

```env
POSTGRES_PASSWORD=use-a-long-random-password
JWT_SECRET=use-a-long-random-secret
```

No VPS SSH or GHCR token secrets are required: the workflow uses its short-lived `GITHUB_TOKEN` to pull the images on the runner. Install Docker Engine and the Docker Compose plugin on the VPS, ensure the runner account can run `docker`, and give the runner the `self-hosted` and `linux` labels. The runner must also be able to write to the parent directory of `VPS_COMPOSE_FILE`.

The API deliberately uses seeded in-memory data so the demo works without database configuration. Data resets when the API restarts. Recommendations are educational decision support and never medical diagnosis, prescriptions, or emergency advice.
