import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useViewport } from '@xyflow/react'
import type { PortDef } from '../schemas/nodeDefinitions'
import { PORT_COLORS, type PortType } from '../schemas/portRegistry'

export interface BaseNodeData {
  label: string
  color: string
  inputs: PortDef[]
  outputs: PortDef[]
  config: Record<string, unknown>
  [key: string]: unknown
}

interface BaseNodeProps extends NodeProps {
  data: BaseNodeData
}

/**
 * LOD 阈值常量
 * - 远景 (< 0.4): 仅色块 + 缩写
 * - 中景 (0.4 ~ 0.7): 标题 + 端口圆点
 * - 近景 (>= 0.7): 完整内容
 */
const ZOOM_FAR = 0.4
const ZOOM_MID = 0.7

/**
 * BaseNode - 所有自定义节点的基类
 *
 * 根据视口缩放级别自动切换渲染粒度（Level-of-Detail），
 * 在复杂工作流（30+ 节点）中显著提升拖拽帧率。
 */
export const BaseNode = memo(function BaseNode({ data, id }: BaseNodeProps) {
  const { zoom } = useViewport()

  // 远景模式：仅色块 + 缩写标签
  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: data.color }}
      >
        {data.label.substring(0, 3)}
      </div>
    )
  }

  // 中景模式：标题 + 端口圆点，隐藏配置表单
  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: data.color }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{data.label}</div>

        {/* 输入端口 */}
        {data.inputs.map((input) => (
          <Handle
            key={`${id}-input-${input.name}`}
            type="target"
            position={Position.Left}
            id={input.name}
            style={{
              backgroundColor: PORT_COLORS[input.type as PortType],
              width: 8,
              height: 8,
            }}
          />
        ))}

        {/* 输出端口 */}
        {data.outputs.map((output) => (
          <Handle
            key={`${id}-output-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: 8,
              height: 8,
            }}
          />
        ))}
      </div>
    )
  }

  // 近景模式：完整渲染（由具体节点组件覆盖此部分）
  return null
})
