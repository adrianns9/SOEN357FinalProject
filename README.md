# Tasked - Student Team Collaboration Platform

## Motivation

Teamwork is a cornerstone of university education, yet students consistently struggle with the same recurring problems: lack of coordination, poor communication, unclear accountability, and fragmented task management. Teams are scattered across messaging apps, shared documents, and calendar tools - each doing one thing well, but none of them talking to each other.

Professional tools like Jira are powerful but intimidating and often paywalled. Trello is visual but lacks communication. Notion is flexible but offers no structured workflow for newcomers. Students end up context-switching constantly between platforms, a habit that research has shown reduces productivity and increases cognitive load.

**Tasked** is a lightweight, student-centered collaboration platform that brings task assignment, progress tracking, and team communication into a single cohesive interface. Designed specifically for undergraduate and graduate students working in teams of 2–6 on short-term academic projects, it removes the overhead of professional tooling while keeping the features that matter: a Kanban board, task-level discussions, and direct messaging - all in one place.

Our hypothesis: a unified, purpose-built tool will help students complete project tasks more efficiently and report better coordination than teams relying on a patchwork of separate applications.

---

## Features

- **Kanban Board** - Visualize tasks across columns; drag and drop to update status
- **Task Management** - Create, assign, and track tasks with per-task chat threads
- **Direct Messaging** - Communicate with teammates without leaving the app
- **Project Workspaces** - Invite members and manage multiple projects
- **Real-time Backend** - Powered by [PocketBase](https://pocketbase.io/)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Mantine UI |
| Routing | React Router v7 |
| Data Fetching | TanStack React Query |
| Backend | PocketBase (via Docker) |
| Build Tool | Vite |
| Testing | Vitest + React Testing Library |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) (v4)
- [Docker](https://www.docker.com/)

---

### A. Starting Production Server

```bash
yarn start:prod
```

The app will be available at **http://localhost:3000**.

---

### B. Starting Development Server

#### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

#### 2. Install dependencies

```bash
yarn install
```

#### 3. Start the database

Run PocketBase locally using Docker:

```bash
yarn start:database
```

This starts a PocketBase instance at **http://localhost:8090** with the following default credentials:

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `password` |

> The database data is persisted in the `./pb_data` directory.

---

#### 4. Import the database schema

1. Open the PocketBase Admin UI at **http://localhost:8090/_/**
2. Log in using the credentials above
3. Navigate to **Settings → Import collections**
4. Upload the `pb_schema.json` file found at the root of this project
5. Confirm the import

This will create all required collections (projects, tasks, users, messages, etc.).

---

#### 5. Start the development server

```bash
yarn dev
```

The app will be available at **http://localhost:5173**.

---

## npm Scripts

### Development

| Script | Description |
|---|---|
| `yarn dev` | Start the Vite development server |
| `yarn build` | Compile TypeScript and build for production |
| `yarn preview` | Preview the production build locally |
| `yarn start:database` | Start the PocketBase database via Docker |

### Testing & Quality

| Script | Description |
|---|---|
| `yarn typecheck` | Check TypeScript types |
| `yarn lint` | Run oxlint and stylelint |
| `yarn format:test` | Check formatting with oxfmt |
| `yarn format:write` | Auto-format all files |

## Project Structure

```
src/
├── api/            # PocketBase API calls (CRUD factory + per-resource files)
├── components/     # Feature components (BoardPage, ProjectPage, InvitePage)
├── lib/            # PocketBase client & React Query key definitions
├── pages/          # Top-level route pages
├── queries/        # TanStack Query hooks per resource
├── schemas/        # Zod validation schemas
├── App.tsx
└── Router.tsx
```