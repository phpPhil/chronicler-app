# Chronicler Monorepo

This monorepo contains both the frontend and backend applications for the Chronicler project, managed with [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces).

## Structure

- `frontend/` – React app (TypeScript)
- `backend/` – Node.js app (TypeScript)

## Getting Started

### Install all dependencies (root)

```bash
npm install
```

This will install dependencies for both workspaces (`frontend` and `backend`).

### Running scripts

You can now run scripts for each workspace from the root using the following commands:

#### Frontend

```bash
npm run frontend:start
npm run frontend:test
npm run frontend:build
```

#### Backend

```bash
npm run backend:dev
npm run backend:start
npm run backend:test
```

---

Feel free to expand this README as your project grows! 