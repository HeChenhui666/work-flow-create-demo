import { describe, it, expect } from 'vitest'
import { NODE_DEFINITIONS, NODE_TYPES } from '../nodeDefinitions'
import { PORT_TYPES } from '../portRegistry'

describe('nodeDefinitions', () => {
  it('每个节点类型都有定义', () => {
    NODE_TYPES.forEach((type) => {
      expect(NODE_DEFINITIONS[type]).toBeDefined()
    })
  })

  it('所有端口 type 都是合法的 PortType', () => {
    NODE_TYPES.forEach((nodeType) => {
      const def = NODE_DEFINITIONS[nodeType]
      ;[...def.inputs, ...def.outputs].forEach((port) => {
        expect(PORT_TYPES).toContain(port.type)
      })
    })
  })

  it('LoadCheckpoint 有 3 个输出端口，无输入', () => {
    const def = NODE_DEFINITIONS.LoadCheckpoint
    expect(def.inputs).toHaveLength(0)
    expect(def.outputs).toHaveLength(3)
  })

  it('KSampler 有 3 个输入端口，1 个输出', () => {
    const def = NODE_DEFINITIONS.KSampler
    expect(def.inputs).toHaveLength(3)
    expect(def.outputs).toHaveLength(1)
  })

  it('每个节点 color 都是合法的 hex 颜色', () => {
    NODE_TYPES.forEach((type) => {
      expect(NODE_DEFINITIONS[type].color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})
