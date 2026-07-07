import { describe, it, expect } from 'vitest'
import { workflowDefinitionSchema } from '../workflow'

const validDef = {
  id: 'wf-1',
  name: 'Test',
  nodes: [
    { id: 'n1', type: 'LoadCheckpoint', position: { x: 0, y: 0 }, config: { modelName: 'v1.5' } },
  ],
  edges: [],
  metadata: { version: 1, updatedAt: '2026-07-03T00:00:00Z' },
}

describe('workflowDefinitionSchema', () => {
  it('解析合法数据', () => {
    expect(() => workflowDefinitionSchema.parse(validDef)).not.toThrow()
  })

  it('接受任意字符串节点类型（插件化注册）', () => {
    const custom = { ...validDef, nodes: [{ ...validDef.nodes[0], type: 'CustomPluginNode' }] }
    expect(() => workflowDefinitionSchema.parse(custom)).not.toThrow()
  })

  it('拒绝缺少 position 的节点', () => {
    const invalid = { ...validDef, nodes: [{ id: 'n1', type: 'LoadCheckpoint', config: {} }] }
    expect(() => workflowDefinitionSchema.parse(invalid)).toThrow()
  })
})
