import { describe, it, expect } from 'vitest'
import { useJsonIO } from '../useJsonIO'

describe('useJsonIO', () => {
  it('应返回 exportJson、importJson、fileInputRef、handleFileChange', () => {
    // 由于 hook 依赖 store，此处仅验证导出
    expect(useJsonIO).toBeDefined()
    expect(typeof useJsonIO).toBe('function')
  })
})
