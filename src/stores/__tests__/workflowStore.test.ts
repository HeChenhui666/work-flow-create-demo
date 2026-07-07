import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkflowStore } from '../workflowStore'
import type { Node } from '@xyflow/react'

const makeNode = (id: string): Node => ({
  id,
  position: { x: 0, y: 0 },
  data: {},
  type: 'default',
})

function getState() {
  return useWorkflowStore.getState()
}

describe('workflowStore undo/redo', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      _history: { past: [], future: [] },
    } as any)
  })

  it('commit 将当前快照推入 past', () => {
    getState().commit()
    expect(getState()._history.past).toHaveLength(1)
  })

  it('addNode 自动触发 commit，undo 后节点恢复为空', () => {
    getState().addNode(makeNode('n1'))
    expect(getState().nodes).toHaveLength(1)
    getState().undo()
    expect(getState().nodes).toHaveLength(0)
  })

  it('redo 重做撤销的 addNode', () => {
    getState().addNode(makeNode('n1'))
    getState().undo()
    getState().redo()
    expect(getState().nodes).toHaveLength(1)
  })

  it('past 最多保留 50 条', () => {
    for (let i = 0; i < 60; i++) getState().commit()
    expect(getState()._history.past.length).toBeLessThanOrEqual(50)
  })

  it('addNode 后历史中存有 past 快照', () => {
    getState().addNode(makeNode('n1'))
    expect(getState()._history.past.length).toBeGreaterThan(0)
  })

  it('没有历史时 undo 不报错', () => {
    expect(() => getState().undo()).not.toThrow()
  })

  it('没有 future 时 redo 不报错', () => {
    expect(() => getState().redo()).not.toThrow()
  })
})
