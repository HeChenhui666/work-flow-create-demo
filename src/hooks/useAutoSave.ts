import { useEffect, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface AutoSaveInput {
  nodes: Node[]
  edges: Edge[]
  isDirty: boolean
}

export function useAutoSave({ nodes, edges, isDirty }: AutoSaveInput) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          'workflow-autosave',
          JSON.stringify({ nodes, edges, savedAt: Date.now() }),
        )
      } catch (_) {}
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, isDirty])
}
