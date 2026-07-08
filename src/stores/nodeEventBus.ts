import { create } from 'zustand'

export interface NodeEventMap {
  'mount':            { nodeId: string }
  'unmount':          { nodeId: string }
  'connect':          { nodeId: string; port: string; fromNodeId: string }
  'disconnect':       { nodeId: string; port: string }
  'config-change':    { nodeId: string; key: string; prev: unknown; next: unknown }
  'before-execute':   { nodeId: string }
  'execute-progress': { nodeId: string; percent: number }
  'execute-success':  { nodeId: string; duration: number }
  'execute-error':    { nodeId: string; error: string }
  'upstream-ready':   { nodeId: string; port: string; fromNodeId: string }
}

export type NodeEventType = keyof NodeEventMap
export type NodeEventPayload<T extends NodeEventType> = NodeEventMap[T]
export type NodeEventHandler<T extends NodeEventType> = (payload: NodeEventPayload<T>) => void

interface EventBusState {
  listeners: Map<NodeEventType, Set<NodeEventHandler<any>>>
  eventLog: Array<{ type: NodeEventType; payload: unknown; timestamp: number }>
  on: <T extends NodeEventType>(type: T, handler: NodeEventHandler<T>) => () => void
  off: <T extends NodeEventType>(type: T, handler: NodeEventHandler<T>) => void
  emit: <T extends NodeEventType>(type: T, payload: NodeEventPayload<T>) => void
  clearLog: () => void
}

export const useNodeEventBus = create<EventBusState>((set, get) => ({
  listeners: new Map(),
  eventLog: [],

  on: (type, handler) => {
    const { listeners } = get()
    if (!listeners.has(type)) {
      listeners.set(type, new Set())
    }
    listeners.get(type)!.add(handler)
    set({ listeners: new Map(listeners) })
    return () => get().off(type, handler)
  },

  off: (type, handler) => {
    const { listeners } = get()
    listeners.get(type)?.delete(handler)
    set({ listeners: new Map(listeners) })
  },

  emit: (type, payload) => {
    const { listeners, eventLog } = get()
    const handlers = listeners.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try { handler(payload) } catch (_) {}
      })
    }
    set({
      eventLog: [...eventLog.slice(-99), { type, payload, timestamp: Date.now() }],
    })
  },

  clearLog: () => set({ eventLog: [] }),
}))
