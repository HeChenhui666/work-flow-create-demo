import type { Node, Edge } from '@xyflow/react'

export interface ValidationIssue {
  type: 'cycle' | 'isolated' | 'disconnected'
  message: string
  nodeId?: string
}

function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>()
  for (const node of nodes) adj.set(node.id, [])
  for (const edge of edges) adj.get(edge.source)?.push(edge.target)

  const visited = new Set<string>()
  const inStack = new Set<string>()

  function dfs(id: string): boolean {
    visited.add(id)
    inStack.add(id)
    for (const neighbor of adj.get(id) ?? []) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true
      if (inStack.has(neighbor)) return true
    }
    inStack.delete(id)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) return true
  }
  return false
}

function hasDisconnectedComponents(nodes: Node[], edges: Edge[]): boolean {
  if (nodes.length <= 1) return false

  const adj = new Map<string, Set<string>>()
  for (const node of nodes) adj.set(node.id, new Set())
  for (const edge of edges) {
    adj.get(edge.source)?.add(edge.target)
    adj.get(edge.target)?.add(edge.source) // 无向图遍历
  }

  const visited = new Set<string>()
  let componentCount = 0

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      componentCount++
      if (componentCount > 1) return true // 发现多个连通分量

      // BFS 遍历当前连通分量
      const queue = [node.id]
      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        for (const neighbor of adj.get(current) ?? []) {
          if (!visited.has(neighbor)) queue.push(neighbor)
        }
      }
    }
  }

  return false
}

export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (hasCycle(nodes, edges)) {
    issues.push({ type: 'cycle', message: '工作流包含循环依赖，无法执行' })
  }

  if (hasDisconnectedComponents(nodes, edges)) {
    issues.push({ type: 'disconnected', message: '工作流包含多个不连通的子图，请检查连线' })
  }

  const connected = new Set<string>()
  for (const edge of edges) {
    connected.add(edge.source)
    connected.add(edge.target)
  }
  for (const node of nodes) {
    if (!connected.has(node.id)) {
      issues.push({
        type: 'isolated',
        message: `节点 ${node.type ?? node.id} 未连接到任何边`,
        nodeId: node.id,
      })
    }
  }

  return issues
}
