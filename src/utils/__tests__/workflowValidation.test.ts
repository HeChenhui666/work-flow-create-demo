import { describe, it, expect } from 'vitest'
import { validateWorkflow } from '../workflowValidation'
import type { Node, Edge } from '@xyflow/react'

const makeNode = (id: string): Node => ({ id, position: { x: 0, y: 0 }, data: {}, type: 'default' })
const makeEdge = (source: string, target: string): Edge => ({ id: `${source}-${target}`, source, target })

describe('validateWorkflow', () => {
  it('空画布无错误', () => {
    expect(validateWorkflow([], [])).toHaveLength(0)
  })

  it('无环图无错误', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')]
    expect(validateWorkflow(nodes, edges)).toHaveLength(0)
  })

  it('有环时返回循环错误', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'a')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.type === 'cycle')).toBe(true)
  })

  it('孤立节点返回警告', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b')]
    const warns = validateWorkflow(nodes, edges)
    expect(warns.some((w) => w.type === 'isolated' && w.nodeId === 'c')).toBe(true)
  })
})
