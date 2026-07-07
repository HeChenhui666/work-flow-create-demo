import { useCallback } from 'react'
import type { Connection, Node } from '@xyflow/react'
import { NODE_DEFINITIONS, type NodeType } from '../schemas/nodeDefinitions'

/**
 * useConnection - 提供连线类型校验能力
 *
 * 核心规则：只有 sourcePort.type === targetPort.type 才允许连接。
 * 这是生图工作流"防止连错线"的核心体验保障。
 */
export function useConnection() {
  const isValidConnection = useCallback(
    (connection: Connection, nodes: Node[]) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return false

      // 禁止自连
      if (sourceNode.id === targetNode.id) return false

      const sourceNodeType = sourceNode.type as NodeType | undefined
      const targetNodeType = targetNode.type as NodeType | undefined

      if (!sourceNodeType || !targetNodeType) return false

      const sourceDef = NODE_DEFINITIONS[sourceNodeType]
      const targetDef = NODE_DEFINITIONS[targetNodeType]

      if (!sourceDef || !targetDef) return false

      // 查找 source 输出端口和 target 输入端口的类型
      const sourcePort = sourceDef.outputs.find(
        (port) => port.name === connection.sourceHandle,
      )
      const targetPort = targetDef.inputs.find(
        (port) => port.name === connection.targetHandle,
      )

      if (!sourcePort || !targetPort) return false

      // 核心校验：端口类型必须完全匹配
      return sourcePort.type === targetPort.type
    },
    [],
  )

  return { isValidConnection }
}
