import { describe, it, expect, vi } from 'vitest'

vi.mock('@dagrejs/dagre', () => {
  class MockGraph {
    setDefaultEdgeLabel = vi.fn()
    setGraph = vi.fn()
    setNode = vi.fn()
    setEdge = vi.fn()
    node = vi.fn(() => ({ x: 100, y: 200 }))
  }
  return {
    Graph: MockGraph,
    layout: vi.fn(),
  }
})

import { autoLayout } from '../autoLayout'
import type { Node, Edge } from '@xyflow/react'

describe('autoLayout', () => {
  it('返回与输入节点数量相同的节点', () => {
    const nodes: Node[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: {}, type: 'default' },
      { id: 'b', position: { x: 0, y: 0 }, data: {}, type: 'default' },
    ]
    const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]
    const result = autoLayout(nodes, edges)
    expect(result).toHaveLength(2)
  })

  it('空节点列表返回空数组', () => {
    expect(autoLayout([], [])).toHaveLength(0)
  })
})
