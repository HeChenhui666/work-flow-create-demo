import type { WorkflowDefinition } from '../schemas/workflow'

export function validateWorkflow(def: WorkflowDefinition): string[] {
  const errors: string[] = []
  const { nodes, edges } = def

  if (nodes.length === 0) return errors

  // 孤立节点检测（节点既无入边也无出边）
  const connectedIds = new Set<string>()
  edges.forEach((e) => {
    connectedIds.add(e.source)
    connectedIds.add(e.target)
  })
  nodes.forEach((n) => {
    if (!connectedIds.has(n.id)) {
      errors.push(`节点 [${n.id}] (${n.type}) 是孤立节点，未与任何其他节点连接`)
    }
  })

  // 必填项检测
  nodes.forEach((n) => {
    if (n.type === 'CLIPEncode') {
      const prompt = (n.config.positivePrompt as string) ?? ''
      if (!prompt.trim()) {
        errors.push(`节点 [${n.id}] (CLIPEncode) 的 positivePrompt 不能为空`)
      }
    }
  })

  return errors
}
