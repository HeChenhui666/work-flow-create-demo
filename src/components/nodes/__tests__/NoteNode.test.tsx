import { describe, it, expect } from 'vitest'
import { NoteNode } from '../NoteNode'

describe('NoteNode', () => {
  it('应被正确导出为 memo 组件', () => {
    expect(NoteNode).toBeDefined()
    expect(typeof NoteNode).toBe('object') // memo 返回对象
  })
})
