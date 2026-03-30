# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run migrations after schema changes
npx prisma migrate dev
```

## Environment

Copy `.env` and add `ANTHROPIC_API_KEY` to use real Claude. Without it, the app falls back to `MockLanguageModel` in `src/lib/provider.ts`, which returns static hardcoded components (counter/form/card) — useful for development without API costs.

Set `JWT_SECRET` in production; it defaults to `"development-secret-key"`.

## Architecture

This is a Next.js 15 App Router app that lets users describe React components in a chat, generates them via Claude using tool calls, and renders a live preview — all without writing files to disk.

### Data flow

1. User types a prompt in `ChatInterface` → sends to `/api/chat` (POST)
2. `route.ts` calls `getLanguageModel()` (real Claude or mock), streams the response via Vercel AI SDK `streamText`
3. Claude uses two tools to generate code: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
4. Tool calls stream back to the client; `ChatContext` intercepts them via `onToolCall` and dispatches to `FileSystemContext.handleToolCall`
5. `FileSystemContext` mutates the in-memory `VirtualFileSystem` and increments `refreshTrigger`
6. `PreviewFrame` reacts to `refreshTrigger`, calls `createImportMap()` which Babel-transforms all files to blob URLs, builds an import map, and sets `iframe.srcdoc` to the generated HTML

### Key abstractions

**`VirtualFileSystem`** (`src/lib/file-system.ts`) — in-memory tree of `FileNode` objects. All generated code lives here; nothing is written to disk. Serialized as `Record<string, FileNode>` and sent with every chat API request so the server can reconstruct context.

**`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — React context wrapping `VirtualFileSystem`. Exposes `handleToolCall` which routes AI tool calls (`str_replace_editor`, `file_manager`) to the appropriate VFS mutations.

**`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — Thin wrapper over Vercel AI SDK `useChat`. Passes the serialized file system in every request body and bridges `onToolCall` to `FileSystemContext`.

**`jsx-transformer.ts`** (`src/lib/transform/jsx-transformer.ts`) — Client-side Babel transform pipeline. `createImportMap()` transforms all VFS files to blob URLs, resolves `@/` path aliases, generates placeholder modules for missing imports, and fetches third-party packages from `esm.sh`. `createPreviewHTML()` assembles the full iframe HTML with an import map and React error boundary.

**`provider.ts`** (`src/lib/provider.ts`) — `getLanguageModel()` returns `anthropic("claude-haiku-4-5")` if `ANTHROPIC_API_KEY` is set, otherwise `MockLanguageModel`. The mock simulates the same tool-call sequence as real Claude to enable offline dev.

### Auth & persistence

- Custom JWT auth via `jose` — sessions stored in httpOnly cookies, logic in `src/lib/auth.ts`
- Users can work anonymously; anonymous work is tracked in `src/lib/anon-work-tracker.ts` and can be saved after sign-up
- Prisma + SQLite (`prisma/dev.db`) — `User` and `Project` models. Projects store serialized messages and VFS state as JSON strings
- Prisma client is generated to `src/generated/prisma/` (not the default location)

### Server actions

`src/actions/` contains Next.js server actions for `create-project`, `get-project`, and `get-projects`. These are the only server-side data access points outside the chat API route.