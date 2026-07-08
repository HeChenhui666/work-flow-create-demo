import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDnD } from '../useDnD'
import type { ReactFlowInstance } from '@xyflow/react'

describe('useDnD', () => {
  it('onDragStart 应设置正确的 dataTransfer 数据', () => {
    const { result } = renderHook(() => useDnD())

    const setDataMock = vi.fn()
    const event = {
      dataTransfer: {
        setData: setDataMock,
        effectAllowed: '',
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDragStart('LoadCheckpoint')(event)
    })

    expect(setDataMock).toHaveBeenCalledWith('application/flow-node-type', 'LoadCheckpoint')
    expect(event.dataTransfer.effectAllowed).toBe('move')
  })

  it('onDragOver 应调用 preventDefault 并设置 dropEffect', () => {
    const { result } = renderHook(() => useDnD())

    const preventDefaultMock = vi.fn()
    const event = {
      preventDefault: preventDefaultMock,
      dataTransfer: { dropEffect: '' },
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDragOver(event)
    })

    expect(preventDefaultMock).toHaveBeenCalled()
    expect(event.dataTransfer.dropEffect).toBe('move')
  })

  it('onDrop 在无 reactFlowInstance 时不应调用 onNodeAdd', () => {
    const { result } = renderHook(() => useDnD())
    const onNodeAddMock = vi.fn()

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn().mockReturnValue('LoadCheckpoint'),
      },
      clientX: 100,
      clientY: 200,
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDrop(event, onNodeAddMock)
    })

    expect(onNodeAddMock).not.toHaveBeenCalled()
  })

  it('onDrop 在有效 instance 和节点类型时应创建节点', () => {
    const { result } = renderHook(() => useDnD())
    const onNodeAddMock = vi.fn()

    const mockInstance = {
      screenToFlowPosition: vi.fn().mockReturnValue({ x: 50, y: 75 }),
    } as unknown as ReactFlowInstance

    // 设置 instance
    act(() => {
      result.current.setReactFlowInstance(mockInstance)
    })

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn().mockReturnValue('KSampler'),
      },
      clientX: 300,
      clientY: 400,
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDrop(event, onNodeAddMock)
    })

    expect(mockInstance.screenToFlowPosition).toHaveBeenCalledWith({
      x: 300,
      y: 400,
    })
    expect(onNodeAddMock).toHaveBeenCalledTimes(1)

    const addedNode = onNodeAddMock.mock.calls[0][0]
    expect(addedNode.type).toBe('KSampler')
    expect(addedNode.position).toEqual({ x: 50, y: 75 })
    expect(addedNode.id).toBeDefined()
    expect(addedNode.data.label).toBe('采样器')
    // 节点应包含完整的渲染所需字段
    expect(addedNode.data.color).toBeDefined()
    expect(Array.isArray(addedNode.data.inputs)).toBe(true)
    expect(Array.isArray(addedNode.data.outputs)).toBe(true)
    // KSampler 应有默认配置（嵌套在 config 字段内）
    expect(addedNode.data.config.steps).toBe(20)
    expect(addedNode.data.config.cfg).toBe(7)
  })

  it('onDrop 对无效节点类型不应创建节点', () => {
    const { result } = renderHook(() => useDnD())
    const onNodeAddMock = vi.fn()

    const mockInstance = {
      screenToFlowPosition: vi.fn(),
    } as unknown as ReactFlowInstance

    act(() => {
      result.current.setReactFlowInstance(mockInstance)
    })

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn().mockReturnValue('InvalidNodeType'),
      },
      clientX: 100,
      clientY: 200,
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDrop(event, onNodeAddMock)
    })

    expect(onNodeAddMock).not.toHaveBeenCalled()
    expect(mockInstance.screenToFlowPosition).not.toHaveBeenCalled()
  })

  it('onDrop 对空节点类型不应创建节点', () => {
    const { result } = renderHook(() => useDnD())
    const onNodeAddMock = vi.fn()

    const mockInstance = {
      screenToFlowPosition: vi.fn(),
    } as unknown as ReactFlowInstance

    act(() => {
      result.current.setReactFlowInstance(mockInstance)
    })

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn().mockReturnValue(''),
      },
      clientX: 100,
      clientY: 200,
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDrop(event, onNodeAddMock)
    })

    expect(onNodeAddMock).not.toHaveBeenCalled()
  })

  it('setReactFlowInstance 应正确存储和清除 instance', () => {
    const { result } = renderHook(() => useDnD())
    const onNodeAddMock = vi.fn()

    const mockInstance = {
      screenToFlowPosition: vi.fn().mockReturnValue({ x: 10, y: 20 }),
    } as unknown as ReactFlowInstance

    // 设置 instance
    act(() => {
      result.current.setReactFlowInstance(mockInstance)
    })

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn().mockReturnValue('EmptyLatent'),
      },
      clientX: 100,
      clientY: 200,
    } as unknown as React.DragEvent

    act(() => {
      result.current.onDrop(event, onNodeAddMock)
    })

    expect(onNodeAddMock).toHaveBeenCalledTimes(1)

    // 清除 instance
    act(() => {
      result.current.setReactFlowInstance(null)
    })

    const onNodeAddMock2 = vi.fn()
    act(() => {
      result.current.onDrop(event, onNodeAddMock2)
    })

    expect(onNodeAddMock2).not.toHaveBeenCalled()
  })
})
