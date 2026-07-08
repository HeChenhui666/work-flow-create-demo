import { describe, it, expect } from 'vitest'
import { definitionToRF, rfToDefinition } from '../converters'
import type { WorkflowDefinition } from '../workflow'

const sampleDef: WorkflowDefinition = {
  id: 'wf-1',
  name: 'Sample',
  nodes: [
    { id: 'n1', type: 'LoadCheckpoint', position: { x: 0, y: 0 }, config: { modelName: 'v1.5' } },
    { id: 'n2', type: 'VAEDecode', position: { x: 400, y: 0 }, config: {} },
  ],
  edges: [{ id: 'e1', source: 'n1', sourceHandle: 'VAE', target: 'n2', targetHandle: 'VAE' }],
  metadata: { version: 1, updatedAt: '2026-07-03T00:00:00Z' },
}

describe('definitionToRF', () => {
  it('节点数量、id、type、position 保留', () => {
    const { nodes } = definitionToRF(sampleDef)
    expect(nodes).toHaveLength(2)
    expect(nodes[0].id).toBe('n1')
    expect(nodes[0].type).toBe('LoadCheckpoint')
    expect(nodes[0].position).toEqual({ x: 0, y: 0 })
  })

  it('节点 data 包含 inputs/outputs/color/config', () => {
    const { nodes } = definitionToRF(sampleDef)
    expect(nodes[0].data.outputs).toHaveLength(3)
    expect(nodes[0].data.config).toEqual({ modelName: 'v1.5' })
    expect(nodes[0].data.color).toBe('#a855f7')
  })

  it('边的 type 为 "typed"', () => {
    const { edges } = definitionToRF(sampleDef)
    expect(edges[0].type).toBe('typed')
  })
})

describe('rfToDefinition (round-trip)', () => {
  it('还原后节点与边数量一致', () => {
    const { nodes, edges } = definitionToRF(sampleDef)
    const restored = rfToDefinition(nodes, edges, { id: sampleDef.id, name: sampleDef.name })
    expect(restored.nodes).toHaveLength(2)
    expect(restored.edges).toHaveLength(1)
  })

  it('config 字段在往返转换后完整保留', () => {
    const { nodes, edges } = definitionToRF(sampleDef)
    const restored = rfToDefinition(nodes, edges, { id: sampleDef.id, name: sampleDef.name })
    expect(restored.nodes[0].config).toEqual({ modelName: 'v1.5' })
  })
})
