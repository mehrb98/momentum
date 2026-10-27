# Momentum task manager

A Next.js App Router task manager with Better Auth, Prisma/PostgreSQL, TypeScript, Zod, React Hook Form, HeroUI v3, and a LangGraph + LangChain AI planner.

## Run with Docker

Requirements: Docker Engine and Compose v2.

```bash
cp .env.example .env
openssl rand -base64 32
```

Paste the generated value into `BETTER_AUTH_SECRET` in `.env`. Choose a URL-safe `POSTGRES_PASSWORD` (or URL-encode special characters in connection strings). Set `OPENAI_API_KEY` to enable AI planning; it is optional for manual task management. If changing the database password, update `DATABASE_URL` for local commands too.

```bash
docker compose up --build
```

Open http://localhost:3000 and create an account. Compose waits for PostgreSQL, applies the committed migration using a separate migration container, and starts the app. Data survives restarts in a named volume. `docker compose down` keeps data; `docker compose down -v` deletes it.

## Local development

Node.js 24 and PostgreSQL required.

```bash
cp .env.example .env
# Configure .env as above.
npm ci
docker compose up -d db
npm run db:generate
npm run db:migrate
npm run dev
```

## Architecture

```text
src/
    app/                    # App Router pages + auth route handler
    actions/                # Authenticated, validated server actions
    components/             # Declarative HeroUI/Tailwind presentation
    hooks/
        auth/               # Sign-in, sign-up, sign-out
        tasks/              # Board interactions and task form
        planner/            # Goal form, AI proposals, acceptance
    lib/
        auth.ts             # Better Auth and session helper
        auth-client.ts
        db.ts               # Prisma + PostgreSQL adapter
        action-result.ts    # Safe action error handling
        services/           # Task ownership and planning orchestration
        ai/                 # LangGraph planning → review → validation
    schemas/                # Zod schemas shared by hooks and actions
    types/                  # Shared DTOs and action results
    styles/global.css       # Tailwind + HeroUI + theme styling
prisma/
    schema.prisma
    migrations/
```

Client components bind handlers returned by feature hooks; they never call server actions, auth clients or fetch directly. Hooks own React Hook Form, Zod resolver setup, async execution, pending state, errors and navigation. Server Components load initial authenticated data directly. Hooks call server actions. Every action validates untrusted input and resolves the session on the server. Updates/deletes constrain both task ID and session user ID in the database statement; callers cannot supply an owner. Queries scope by user. Server modules are protected with `server-only` imports. Next.js handles action origin checks; Better Auth handles authentication and trusted origins.

AI planning: authenticated request → database-backed quota (10 requests/user/hour) → LangGraph `propose` node using LangChain ChatOpenAI structured output → LangChain `review` node for missing steps and duplicates → Zod `validate` node → editable preview → explicit save action → atomic database batch. AI has no database write tool. Model calls time out after 30 seconds with one retry. OpenAI receives only the goal you submit, not existing tasks or account data. No persistent graph checkpoint is necessary for this short request/response workflow; drafts live in the browser until saved or discarded.

## Features

- Email/password registration, sign-in and sign-out
- Private per-user tasks
- Create, edit, delete; TODO / IN_PROGRESS / DONE
- Priorities, optional due dates, search and priority filter
- Responsive board and progress counts
- AI task proposals, title editing and removal before accepting
- Pending states, error messages and form validation

## Verification

```bash
npm run db:generate
npm run typecheck
npm test
npm run build
```

All 14 automated tests pass. Tests cover schema boundaries, owner-scoped database calls, missing-owner failures, and LangGraph planning/review ordering and invalid-output/provider failure handling. Graph tests mock model responses; ownership tests mock Prisma calls and do not substitute for a live database integration test. TypeScript and production build pass. Docker and PostgreSQL were unavailable in the build environment, so live authentication/database flows and Docker startup were not exercised. No live model call was made without an API key. A local HTTP smoke test could not connect in this executor, so browser/runtime verification remains outstanding. Run the following integration checks against your database: register two users, create a task as A, verify B cannot view/update/delete A's task, exercise sign-in/out, persist changes across a restart, and generate/accept an AI plan with a real API key.

## Deployment notes

This project targets Node.js + Docker, not a static export or Cloudflare Worker. Set `BETTER_AUTH_URL` to the public HTTPS origin and use a strong auth secret. Put TLS termination in front of the app, back up PostgreSQL, and configure email verification/password recovery before opening registration to a public audience. Current scope intentionally excludes email delivery, teams, recurring tasks and graph execution history. The board loads the latest 500 tasks per user; add cursor pagination for larger workloads. AI quota entries are per user; account abuse prevention and spend monitoring remain deployment responsibilities. No credentials are included.

## Conventions

Use four spaces, never tabs. `.editorconfig`, `.prettierrc.json`, and `.vscode/settings.json` enforce this. Run `npm run format:check` before changes are merged. Hooks use `.ts` because they contain no JSX. Client UI components contain presentation, bindings and display conditions only; keep data operations and business logic in hooks/server modules.

The AI consists of a planner and a reviewer inside one short LangGraph workflow. It suggests tasks only; the user edits/removes proposals before saving. Scheduling, autonomous execution, semantic retrieval and persistent conversation memory are outside this version. A separate vector database is not required; PostgreSQL can gain pgvector when semantic retrieval is implemented.
