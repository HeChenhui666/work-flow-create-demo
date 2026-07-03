import { describe, it, expect } from 'vitest'
import { validateWorkflow } from '../validation'
import type { WorkflowDefinition } from '../../schemas/workflow'

const base: WorkflowDefinition = {
  id: 'x', name: 'T', metadata: { version: 1, updatedAt: '' },
  nodes: [], edges: [],
}

describe('validateWorkflow', () => {
  it('空画布无错误', () => {
    expect(validateWorkflow(base)).toHaveLength(0)
  })

  it('孤立节点（无任何边连接）报错', () => {
    const def: WorkflowDefinition = {
      ...base,
      nodes: [
        { id: 'n1', type: 'LoadCheckpoint', position: { x: 0, y: 0 }, config: {} },
        { id: 'n2', type: 'VAEDecode',      position: { x: 300, y: 0 }, config: {} },
      ],
      edges: [],
    }
    const errors = validateWorkflow(def)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some(e => e.includes('n1') || e.includes('n2'))).toBe(true)
  })

  it('有效连接的工作流无错误', () => {
    const def: WorkflowDefinition = {
      ...base,
      nodes: [
        { id: 'n1', type: 'LoadCheckpoint', position: { x: 0, y: 0 },   config: {} },
        { id: 'n2', type: 'VAEDecode',      position: { x: 300, y: 0 }, config: {} },
      ],
      edges: [
        { id: 'e1', source: 'n1', sourceHandle: 'VAE', target: 'n2', targetHandle: 'VAE' },
      ],
    }
    expect(validateWorkflow(def)).toHaveLength(0)
  })

  it('CLIPEncode 正向提示词为空时报错', () => {
    const def: WorkflowDefinition = {
      ...base,
      nodes: [
        { id: 'n1', type: 'CLIPEncode', position: { x: 0, y: 0 }, config: { positivePrompt: '', negativePrompt: '' } },
      ],
      edges: [],
    }
    const errors = validateWorkflow(def)
    expect(errors.some(e => e.includes('n1') && e.includes('positivePrompt'))).toBe(true)
  })
})
