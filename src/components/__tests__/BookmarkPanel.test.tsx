import { describe, it, expect } from 'vitest'
import { BookmarkPanel } from '../BookmarkPanel'

describe('BookmarkPanel', () => {
  it('应被正确导出为函数组件', () => {
    expect(BookmarkPanel).toBeDefined()
    expect(typeof BookmarkPanel).toBe('function')
  })

  it('组件名称应为 BookmarkPanel', () => {
    expect(BookmarkPanel.name).toBe('BookmarkPanel')
  })
})
