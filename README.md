# FlowCanvas - AI Image Generation Workflow Editor

<p align="center">
  <strong>A visual node-based editor for designing AI image generation pipelines</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Features

- **Visual Node Editor** — Drag-and-drop node creation with type-safe port connections
- **9 Node Types** — LoadCheckpoint, CLIPEncode, EmptyLatent, KSampler, VAEDecode, LoRALoader, ImageLoad, ImagePreview, Upscaler
- **Execution Simulation** — Parallel topology-aware execution with progress bars and flow animation
- **Undo/Redo** — Full history stack with Cmd+Z / Cmd+Shift+Z
- **Auto-save** — localStorage persistence with restore prompt
- **Auto Layout** — Dagre-based one-click node arrangement
- **Alignment Tools** — Multi-select snap alignment (left/right/top/bottom/center)
- **Template Library** — Pre-built workflows (txt2img, img2img, hires.fix)
- **Workflow Validation** — Cycle detection and disconnected subgraph warnings
- **PNG Export** — Export canvas as high-resolution image
- **JSON Import/Export** — Save and load workflows, drag-drop JSON files
- **Plugin-ready Architecture** — NodeRegistry singleton, EventBus system, extensible schema

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Flow Engine | @xyflow/react v12 |
| State Management | Zustand v5 |
| Schema Validation | Zod v4 |
| Styling | Tailwind CSS 3 |
| Build Tool | Vite 8 |
| Testing | Vitest + Testing Library |
| Layout Algorithm | @dagrejs/dagre |
| Type System | TypeScript 6 (strict) |

## Quick Start

```bash
# Clone
git clone https://github.com/your-username/flow-canvas.git
cd flow-canvas

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

Open http://localhost:5173 in your browser.

## Usage

1. **Drag nodes** from the left panel onto the canvas
2. **Connect ports** by dragging from output (right) to input (left) — only matching types connect
3. **Click "Run"** to simulate execution with progress animation
4. **Cmd+Z** to undo, **Cmd+Shift+Z** to redo
5. **Right-click** canvas for context menu (add note, auto-fit, reset view)
6. **Right-click** a node to copy or delete it
7. **Multi-select + align** using the toolbar that appears when 2+ nodes are selected
8. **Drop a .json file** onto the canvas to import a workflow

## Architecture

```
src/
├── components/          # React components
│   ├── nodes/           # Node type implementations
│   ├── edges/           # Custom edge rendering
│   └── ...              # Canvas, Palette, Inspector, etc.
├── hooks/               # Custom React hooks
│   ├── useDnD.ts        # Drag-and-drop node creation
│   ├── useConnection.ts # Port type validation
│   ├── useMockExecution.ts # Simulated execution engine
│   └── useAutoSave.ts   # localStorage persistence
├── stores/              # Zustand state stores
│   ├── workflowStore.ts # Nodes, edges, undo/redo
│   ├── executionStore.ts # Execution state, progress
│   └── nodeEventBus.ts  # Event system for node lifecycle
├── schemas/             # Type definitions & registry
│   ├── nodeRegistry.ts  # Pluggable node type registry
│   ├── nodeDefinitions.ts # Built-in node definitions
│   └── workflow.ts      # Zod workflow schema
├── utils/               # Pure utility functions
│   ├── autoLayout.ts    # Dagre layout algorithm
│   ├── workflowValidation.ts # Cycle & connectivity checks
│   └── pngExport.ts     # Canvas-to-PNG export
└── data/                # Static data
    └── workflowTemplates.ts # Pre-built workflow templates
```

## Extending with Custom Nodes

```ts
import { nodeRegistry } from './schemas/nodeRegistry'

nodeRegistry.register({
  type: 'MyCustomNode',
  label: 'My Node',
  color: '#10b981',
  category: 'custom',
  inputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  outputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  defaultConfig: { intensity: 0.5 },
})
```

Then create a React component for rendering and register it in `FlowCanvas.tsx`'s `nodeTypes` map.

## Event System

Subscribe to node lifecycle events:

```ts
import { useNodeEventBus } from './stores/nodeEventBus'

const unsub = useNodeEventBus.getState().on('execute-success', ({ nodeId, duration }) => {
  console.log(`Node ${nodeId} completed in ${duration}s`)
})
```

Available events: `mount`, `unmount`, `connect`, `disconnect`, `config-change`, `before-execute`, `execute-progress`, `execute-success`, `execute-error`, `upstream-ready`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ci` | Run tests once (CI) |
| `pnpm lint` | Lint with ESLint |
| `pnpm lint:fix` | Auto-fix lint errors |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

[MIT](./LICENSE) © 2024-present
