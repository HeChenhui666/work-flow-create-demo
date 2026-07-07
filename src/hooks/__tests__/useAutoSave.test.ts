import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllTimers()
    vi.clearAllMocks()
    localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('2s 后触发 localStorage 写入', async () => {
    const { useAutoSave } = await import('../useAutoSave')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    renderHook(() => useAutoSave({ nodes: [], edges: [], isDirty: true }))

    act(() => { vi.advanceTimersByTime(2100) })

    expect(setItem).toHaveBeenCalledWith(
      'workflow-autosave',
      expect.stringContaining('"nodes"'),
    )
  })

  it('isDirty=false 时不触发写入', async () => {
    const { useAutoSave } = await import('../useAutoSave')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    renderHook(() => useAutoSave({ nodes: [], edges: [], isDirty: false }))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(setItem).not.toHaveBeenCalled()
  })
})
