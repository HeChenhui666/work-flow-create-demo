# Contributing to FlowCanvas

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
pnpm install
pnpm dev
```

## Code Style

- TypeScript strict mode — no `any` unless absolutely necessary
- Functional components with hooks
- Zustand for state, no prop drilling
- Tailwind CSS for styling, no CSS modules
- Run `pnpm lint` before committing

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new node type
fix: resolve connection validation for extended nodes
docs: update README with architecture section
test: add undo/redo store tests
refactor: extract event bus from execution hook
```

## Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass: `pnpm test:ci`
4. Ensure TypeScript compiles: `pnpm build`
5. Ensure lint passes: `pnpm lint`
6. Open a PR with a clear description

## Project Structure

- `src/components/` — React UI components
- `src/hooks/` — Custom hooks (business logic)
- `src/stores/` — Zustand state stores
- `src/schemas/` — Type definitions, validation, registry
- `src/utils/` — Pure utility functions
- `src/data/` — Static data (templates, etc.)

## Adding a New Node Type

1. Register definition in `src/schemas/registerNodes.ts`
2. Create component in `src/components/nodes/`
3. Add to `nodeTypes` map in `src/components/FlowCanvas.tsx`
4. Add execution duration in `src/hooks/useMockExecution.ts`

## Testing

```bash
pnpm test        # watch mode
pnpm test:ci     # single run (CI)
```

We use Vitest + Testing Library. Tests live in `__tests__/` directories next to the code they test.
