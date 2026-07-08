import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Node, Edge } from '@xyflow/react'

interface WorkflowMeta {
  id: string
  name: string
}

interface HistoryEntry {
  nodes: Node[]
  edges: Edge[]
}

interface WorkflowState {
  meta: WorkflowMeta
  nodes: Node[]
  edges: Edge[]
  isDirty: boolean
  validationErrors: string[]
  selectedNodeId: string | null
  _history: { past: HistoryEntry[]; future: HistoryEntry[] }
  setName: (name: string) => void
  setDirty: (dirty: boolean) => void
  setValidationErrors: (errors: string[]) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  addEdge: (edge: Edge) => void
  removeEdge: (edgeId: string) => void
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
  updateNodeDataSilent: (nodeId: string, data: Record<string, unknown>) => void
  setSelectedNodeId: (nodeId: string | null) => void
  commit: () => void
  undo: () => void
  redo: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  meta: { id: nanoid(), name: '未命名工作流' },
  nodes: [],
  edges: [],
  isDirty: false,
  validationErrors: [],
  selectedNodeId: null,
  _history: { past: [], future: [] },

  commit: () =>
    set((s) => {
      const snapshot: HistoryEntry = { nodes: s.nodes, edges: s.edges }
      const past = [...s._history.past, snapshot].slice(-50)
      return { _history: { past, future: [] } }
    }),

  undo: () =>
    set((s) => {
      const { past, future } = s._history
      if (past.length === 0) return {}
      const prev = past[past.length - 1]
      return {
        nodes: prev.nodes,
        edges: prev.edges,
        isDirty: true,
        _history: {
          past: past.slice(0, -1),
          future: [{ nodes: s.nodes, edges: s.edges }, ...future],
        },
      }
    }),

  redo: () =>
    set((s) => {
      const { past, future } = s._history
      if (future.length === 0) return {}
      const next = future[0]
      return {
        nodes: next.nodes,
        edges: next.edges,
        isDirty: true,
        _history: {
          past: [...past, { nodes: s.nodes, edges: s.edges }],
          future: future.slice(1),
        },
      }
    }),

  setName: (name) => set((s) => ({ meta: { ...s.meta, name }, isDirty: true })),
  setDirty: (isDirty) => set({ isDirty }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  addNode: (node) => {
    get().commit()
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true }))
  },

  removeNode: (nodeId) => {
    get().commit()
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
      isDirty: true,
    }))
  },

  addEdge: (edge) => {
    get().commit()
    set((s) => ({ edges: [...s.edges, edge], isDirty: true }))
  },

  removeEdge: (edgeId) => {
    get().commit()
    set((s) => ({ edges: s.edges.filter((e) => e.id !== edgeId), isDirty: true }))
  },

  updateNodeData: (nodeId, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
      isDirty: true,
    })),

  updateNodeDataSilent: (nodeId, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
    })),

  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
}))
