# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, and Claude generates them in real-time with a virtual filesystem and live preview in an iframe.

## Common Commands

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run lint             # Run ESLint
npm run test             # Run Vitest unit tests
npm run setup            # Install deps, generate Prisma client, run migrations
npm run db:reset         # Reset SQLite database
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI**: Radix UI + ShadcN/ui components, Monaco Editor, Lucide icons
- **Backend**: Next.js API routes, Prisma with SQLite
- **AI**: Vercel AI SDK with Anthropic Claude (claude-haiku-4-5)
- **Auth**: JWT tokens in HTTP-only cookies (jose, bcrypt)

## Architecture

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/actions/` - Server actions for auth and project CRUD
- `src/components/` - React components (auth, chat, editor, preview, ui)
- `src/lib/contexts/` - React contexts for chat and filesystem state
- `src/lib/tools/` - AI tool definitions (str_replace_editor, file_manager)
- `src/lib/transform/` - JSX to HTML transformer for live preview

### Core Flow

1. User describes component in chat UI
2. `ChatContext` sends messages to `/api/chat` with virtual files
3. Claude calls tools (`str_replace_editor`, `file_manager`) to create/modify files
4. `FileSystemContext` processes tool calls and updates virtual filesystem
5. `PreviewFrame` transforms JSX via Babel and renders in sandboxed iframe
6. `CodeEditor` displays files with Monaco syntax highlighting

### Virtual Filesystem

`VirtualFileSystem` class (`src/lib/file-system.ts`) manages in-memory file tree. Files are serialized as JSON for database storage. No files written to disk.

### AI Integration

- Chat API: `src/app/api/chat/route.ts`
- System prompt: `src/lib/prompts/generation.tsx`
- Provider selection: `src/lib/provider.ts` (real Claude or mock fallback)
- Tools enable Claude to create, read, and edit files

### Database Schema

- `User`: id, email, password (hashed), timestamps
- `Project`: id, name, userId (optional for anon), messages (JSON), data (JSON)

## Path Aliases

`@/*` maps to `src/*` (e.g., `@/components`, `@/lib/utils`)

## Code Style

- Use comments sparingly. Only comment complex code.

## Environment Variables

- `ANTHROPIC_API_KEY` - Required for real Claude responses (mock fallback without)
- `JWT_SECRET` - For production auth (defaults to dev key)
