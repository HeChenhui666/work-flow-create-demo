import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExecutionStore } from '../../stores/executionStore'

describe('useMockExecution', () => {
  beforeEach(() => {
    useExecutionStore.getState().reset()
  })

  it('导出 runExecution 函数', async () => {
    const { useMockExecution } = await import('../useMockExecution')
    const { result } = renderHook(() => useMockExecution())
    expect(typeof result.current.runExecution).toBe('function')
  })

  it('runExecution 在空节点列表时不报错且 isRunning 保持 false', async () => {
    const { useMockExecution } = await import('../useMockExecution')
    const { result } = renderHook(() => useMockExecution())
    await act(async () => {
      await result.current.runExecution([], [])
    })
    expect(useExecutionStore.getState().isRunning).toBe(false)
  })
})
