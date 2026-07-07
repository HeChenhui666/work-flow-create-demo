import { useCallback } from 'react'
import type { ReactFlowInstance } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { NODE_DEFINITIONS, type NodeType } from '../schemas/nodeDefinitions'
import { nodeRegistry } from '../schemas/nodeRegistry'

// 模块级单例 ref，确保 NodePalette 和 FlowCanvas 共享同一个 instance
let sharedReactFlowInstance: ReactFlowInstance | null = null

/**
 * useDnD - 提供拖拽创建节点的能力
 *
 * 使用方式：
 * 1. 在左侧面板的节点项上绑定 onDragStart={onDragStart(nodeType)}
 * 2. 在 ReactFlow 容器上绑定 onDrop + onDragOver
 * 3. 将 reactFlowInstance 传入 setReactFlowInstance
 */
export function useDnD() {
  const setReactFlowInstance = useCallback((instance: ReactFlowInstance | null) => {
    sharedReactFlowInstance = instance
  }, [])

  /**
   * 左侧面板节点项的 onDragStart 处理器
   * 通过 dataTransfer 传递节点类型信息
   */
  const onDragStart = useCallback(
    (nodeType: string) => (event: React.DragEvent) => {
      event.dataTransfer.setData('application/flow-node-type', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    [],
  )

  /**
   * 画布容器的 onDragOver 处理器
   * 必须调用 preventDefault 才能触发 onDrop
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  /**
   * 画布容器的 onDrop 处理器
   * 将屏幕坐标转换为画布坐标，创建新节点
   *
   * @param onNodeAdd - 节点添加回调，由调用方提供（通常连接到 store）
   */
  const onDrop = useCallback(
    (event: React.DragEvent, onNodeAdd: (node: { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }) => void) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData('application/flow-node-type')
      if (!nodeType) return

      // 优先从 NODE_DEFINITIONS 查找，其次从 nodeRegistry 查找
      const legacyDef = NODE_DEFINITIONS[nodeType as NodeType]
      const registryDef = nodeRegistry.get(nodeType)

      if (!legacyDef && !registryDef) return

      const instance = sharedReactFlowInstance
      if (!instance) return

      // 使用 React Flow v12 的 screenToFlowPosition 精确转换坐标
      const position = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const def = legacyDef ?? registryDef!
      const newNode = {
        id: nanoid(),
        type: nodeType,
        position,
        data: {
          label: def.label ?? nodeType,
          color: def.color,
          inputs: def.inputs,
          outputs: def.outputs,
          config: { ...def.defaultConfig },
        },
      }

      onNodeAdd(newNode)
    },
    [],
  )

  return {
    setReactFlowInstance,
    onDragStart,
    onDragOver,
    onDrop,
  }
}
