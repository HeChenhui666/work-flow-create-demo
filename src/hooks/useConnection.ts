import { useCallback } from 'react'
import type { Connection, Node } from '@xyflow/react'
import type { PortDef } from '../schemas/nodeDefinitions'

/**
 * useConnection - 提供连线类型校验能力
 *
 * 核心规则：只有 sourcePort.type === targetPort.type 才允许连接。
 * 端口信息直接从 node.data.inputs/outputs 读取，兼容所有节点类型。
 */
export function useConnection() {
  const isValidConnection = useCallback(
    (connection: Connection, nodes: Node[]) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return false
      if (sourceNode.id === targetNode.id) return false

      const sourceOutputs = (sourceNode.data?.outputs as PortDef[] | undefined) ?? []
      const targetInputs = (targetNode.data?.inputs as PortDef[] | undefined) ?? []

      const sourcePort = sourceOutputs.find(
        (port) => port.name === connection.sourceHandle,
      )
      const targetPort = targetInputs.find(
        (port) => port.name === connection.targetHandle,
      )

      if (!sourcePort || !targetPort) return false

      return sourcePort.type === targetPort.type
    },
    [],
  )

  return { isValidConnection }
}
