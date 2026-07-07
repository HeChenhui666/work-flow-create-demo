import { describe, it, expect, beforeEach } from 'vitest'
import { useExecutionStore } from '../executionStore'

describe('executionStore', () => {
  beforeEach(() => {
    useExecutionStore.getState().reset()
  })

  it('初始状态 isRunning=false，节点状态为空', () => {
    const { isRunning, nodeStatuses } = useExecutionStore.getState()
    expect(isRunning).toBe(false)
    expect(Object.keys(nodeStatuses)).toHaveLength(0)
  })

  it('setNodeStatus 更新指定节点状态', () => {
    useExecutionStore.getState().setNodeStatus('node1', 'running')
    expect(useExecutionStore.getState().nodeStatuses['node1']).toBe('running')
  })

  it('setNodeProgress 更新进度', () => {
    useExecutionStore.getState().setNodeProgress('node1', 50)
    expect(useExecutionStore.getState().nodeProgresses['node1']).toBe(50)
  })

  it('addLog 追加日志条目', () => {
    useExecutionStore.getState().addLog({ nodeId: 'n1', message: 'done', timestamp: 0 })
    expect(useExecutionStore.getState().logs).toHaveLength(1)
  })

  it('reset 清空全部状态', () => {
    useExecutionStore.getState().setNodeStatus('n1', 'success')
    useExecutionStore.getState().reset()
    expect(useExecutionStore.getState().nodeStatuses).toEqual({})
    expect(useExecutionStore.getState().isRunning).toBe(false)
  })
})
