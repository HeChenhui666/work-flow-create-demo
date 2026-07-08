import { useCallback, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { toast } from 'sonner'
import { useExecutionStore } from '../stores/executionStore'
import { useNodeEventBus } from '../stores/nodeEventBus'

function buildTopoLevels(nodes: Node[], edges: Edge[]): Node[][] {
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  for (const n of nodes) {
    inDegree.set(n.id, 0)
    adjList.set(n.id, [])
  }
  for (const e of edges) {
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    adjList.get(e.source)?.push(e.target)
  }

  const levels: Node[][] = []
  let current = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0)

  while (current.length > 0) {
    levels.push(current)
    const next: Node[] = []
    for (const n of current) {
      for (const childId of adjList.get(n.id) ?? []) {
        const deg = (inDegree.get(childId) ?? 1) - 1
        inDegree.set(childId, deg)
        if (deg === 0) {
          const child = nodes.find((x) => x.id === childId)
          if (child) next.push(child)
        }
      }
    }
    current = next
  }

  return levels
}

const NODE_DURATIONS: Record<string, number> = {
  LoadCheckpoint: 1500,
  CLIPEncode:     400,
  EmptyLatent:    100,
  KSampler:       3000,
  VAEDecode:      600,
  LoRALoader:     800,
  ImageLoad:      200,
  ImagePreview:   100,
  Upscaler:       2000,
  default:        500,
}

export function useMockExecution() {
  const abortRef = useRef<AbortController | null>(null)

  const runExecution = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (nodes.length === 0) return

    const store = useExecutionStore.getState()
    store.reset()
    store.setRunning(true)

    const controller = new AbortController()
    abortRef.current = controller
    const { signal } = controller

    const startTime = Date.now()
    const levels = buildTopoLevels(nodes, edges)

    try {
      for (const level of levels) {
        if (signal.aborted) break

        await Promise.all(
          level.map(async (node) => {
            if (signal.aborted) return

            const type = node.type ?? 'default'
            const duration = NODE_DURATIONS[type] ?? NODE_DURATIONS.default
            const t0 = Date.now()

            useExecutionStore.getState().setNodeStatus(node.id, 'running')
            useNodeEventBus.getState().emit('before-execute', { nodeId: node.id })

            if (type === 'KSampler') {
              const steps = ((node.data?.config as Record<string, number>)?.steps ?? 20)
              const stepDelay = duration / steps
              for (let i = 1; i <= steps; i++) {
                if (signal.aborted) return
                await new Promise<void>((r) => setTimeout(r, stepDelay))
                const percent = Math.round((i / steps) * 100)
                useExecutionStore.getState().setNodeProgress(node.id, percent)
                useNodeEventBus.getState().emit('execute-progress', { nodeId: node.id, percent })
              }
            } else {
              await new Promise<void>((r) => setTimeout(r, duration))
            }

            if (signal.aborted) return
            useExecutionStore.getState().setNodeStatus(node.id, 'success')
            const elapsed = ((Date.now() - t0) / 1000)
            useExecutionStore.getState().addLog({
              nodeId: node.id,
              message: `${type} ✓ 完成 (${elapsed.toFixed(2)}s)`,
              timestamp: Date.now() - startTime,
            })
            useNodeEventBus.getState().emit('execute-success', { nodeId: node.id, duration: elapsed })

            // 通知下游节点 upstream-ready
            const downstreamEdges = edges.filter((e) => e.source === node.id)
            for (const edge of downstreamEdges) {
              useNodeEventBus.getState().emit('upstream-ready', {
                nodeId: edge.target,
                port: edge.targetHandle ?? '',
                fromNodeId: node.id,
              })
            }
          }),
        )
      }
    } finally {
      abortRef.current = null
      useExecutionStore.getState().setRunning(false)
      if (!signal.aborted) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
        toast.success(`执行完成，总耗时 ${totalTime}s`)
      }
    }
  }, [])

  const stopExecution = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    useExecutionStore.getState().reset()
  }, [])

  return { runExecution, stopExecution }
}
