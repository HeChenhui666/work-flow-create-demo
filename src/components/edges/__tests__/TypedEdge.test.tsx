import { describe, it, expect } from 'vitest'
import { TypedEdge } from '../TypedEdge'

describe('TypedEdge', () => {
  it('应被正确导出为函数组件', () => {
    expect(TypedEdge).toBeDefined()
    expect(typeof TypedEdge).toBe('function')
  })

  it('组件名称应为 TypedEdge', () => {
    expect(TypedEdge.name).toBe('TypedEdge')
  })
})
