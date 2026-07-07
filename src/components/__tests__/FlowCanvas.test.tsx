import { describe, it, expect } from 'vitest'
import { FlowCanvas } from '../FlowCanvas'

/**
 * FlowCanvas 组件测试
 *
 * 注意：React Flow 依赖真实浏览器 DOM API（如 getBoundingClientRect），
 * 在 jsdom 环境中无法完整渲染。因此本测试仅验证：
 * 1. 组件可被正确导入
 * 2. 组件是有效的 React 函数组件
 *
 * 完整的 E2E 渲染测试应使用 Playwright/Cypress 等浏览器测试工具。
 */
describe('FlowCanvas', () => {
  it('应被正确导出为函数组件', () => {
    expect(FlowCanvas).toBeDefined()
    expect(typeof FlowCanvas).toBe('function')
  })

  it('组件名称应为 FlowCanvas', () => {
    expect(FlowCanvas.name).toBe('FlowCanvas')
  })
})
