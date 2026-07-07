import { create } from 'zustand'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export interface LogEntry {
  nodeId: string
  message: string
  timestamp: number
}

interface ExecutionState {
  isRunning: boolean
  nodeStatuses: Record<string, NodeStatus>
  nodeProgresses: Record<string, number>
  logs: LogEntry[]
  setRunning: (v: boolean) => void
  setNodeStatus: (id: string, status: NodeStatus) => void
  setNodeProgress: (id: string, percent: number) => void
  addLog: (entry: LogEntry) => void
  reset: () => void
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isRunning: false,
  nodeStatuses: {},
  nodeProgresses: {},
  logs: [],
  setRunning: (v) => set({ isRunning: v }),
  setNodeStatus: (id, status) =>
    set((s) => ({ nodeStatuses: { ...s.nodeStatuses, [id]: status } })),
  setNodeProgress: (id, percent) =>
    set((s) => ({ nodeProgresses: { ...s.nodeProgresses, [id]: percent } })),
  addLog: (entry) => set((s) => ({ logs: [...s.logs, entry] })),
  reset: () => set({ isRunning: false, nodeStatuses: {}, nodeProgresses: {}, logs: [] }),
}))
