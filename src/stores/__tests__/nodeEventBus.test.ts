import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNodeEventBus } from '../nodeEventBus'

describe('nodeEventBus', () => {
  beforeEach(() => {
    useNodeEventBus.setState({ listeners: new Map(), eventLog: [] })
  })

  it('on/emit 应正确分发事件', () => {
    const handler = vi.fn()
    useNodeEventBus.getState().on('execute-success', handler)
    useNodeEventBus.getState().emit('execute-success', { nodeId: 'n1', duration: 1.5 })
    expect(handler).toHaveBeenCalledWith({ nodeId: 'n1', duration: 1.5 })
  })

  it('off 应取消监听', () => {
    const handler = vi.fn()
    useNodeEventBus.getState().on('mount', handler)
    useNodeEventBus.getState().off('mount', handler)
    useNodeEventBus.getState().emit('mount', { nodeId: 'n1' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('on 返回的 unsubscribe 函数应有效', () => {
    const handler = vi.fn()
    const unsub = useNodeEventBus.getState().on('unmount', handler)
    unsub()
    useNodeEventBus.getState().emit('unmount', { nodeId: 'n1' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('emit 应追加到 eventLog', () => {
    useNodeEventBus
      .getState()
      .emit('config-change', { nodeId: 'n1', key: 'steps', prev: 20, next: 30 })
    expect(useNodeEventBus.getState().eventLog).toHaveLength(1)
    expect(useNodeEventBus.getState().eventLog[0].type).toBe('config-change')
  })

  it('eventLog 最多保留 100 条', () => {
    for (let i = 0; i < 120; i++) {
      useNodeEventBus.getState().emit('mount', { nodeId: `n${i}` })
    }
    expect(useNodeEventBus.getState().eventLog.length).toBeLessThanOrEqual(100)
  })

  it('多个 handler 可同时监听同一事件', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    useNodeEventBus.getState().on('execute-progress', h1)
    useNodeEventBus.getState().on('execute-progress', h2)
    useNodeEventBus.getState().emit('execute-progress', { nodeId: 'n1', percent: 50 })
    expect(h1).toHaveBeenCalled()
    expect(h2).toHaveBeenCalled()
  })

  it('clearLog 应清空事件日志', () => {
    useNodeEventBus.getState().emit('mount', { nodeId: 'n1' })
    useNodeEventBus.getState().clearLog()
    expect(useNodeEventBus.getState().eventLog).toHaveLength(0)
  })
})
