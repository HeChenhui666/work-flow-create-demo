import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react'
import { PORT_COLORS, type PortType } from '../../schemas/portRegistry'
import { useExecutionStore } from '../../stores/executionStore'

/**
 * TypedEdge - 根据端口类型着色的自定义连线
 *
 * 颜色取自 sourceHandle（端口名称）对应的端口类型，
 * 带箭头标记和流动动画，使工作流的数据流向一目了然。
 */
export function TypedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  sourceHandleId,
  selected,
  data,
  source,
}: EdgeProps) {
  // 优先从 data.sourceHandle 获取端口名称（由 onConnect 设置）
  // 回退到 sourceHandleId
  const handleName = (data as Record<string, unknown>)?.sourceHandle as string | undefined
    || sourceHandleId

  let strokeColor = '#94a3b8' // 默认灰色

  if (handleName) {
    const portType = handleName as PortType
    if (portType in PORT_COLORS) {
      strokeColor = PORT_COLORS[portType]
    }
  }

  const sourceStatus = useExecutionStore((s) => s.nodeStatuses[source] ?? 'idle')
  const isAnimating = sourceStatus === 'running'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 动态生成唯一 marker ID
  const markerId = `arrow-${id}`

  return (
    <>
      {/* 内联 SVG marker 定义 */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        </defs>
      </svg>

      {/* 底层发光效果（选中时更明显） */}
      <path
        id={`${id}-glow`}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 6 : 4,
          opacity: selected ? 0.3 : 0.15,
          fill: 'none',
        }}
      />
      {/* 主连线路径 */}
      <path
        id={id}
        className="react-flow__edge-path transition-colors duration-200"
        d={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: selected ? 3 : 2,
          opacity: selected ? 1 : 0.8,
          ...(isAnimating ? {
            strokeDasharray: '8 4',
            animation: 'flowDash 0.6s linear infinite',
          } : {}),
        }}
        markerEnd={`url(#${markerId})`}
      />
      {/* 流动动画点（仅选中时显示） */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="absolute h-2 w-2 rounded-full animate-pulse"
            style={{
              backgroundColor: strokeColor,
              left: labelX,
              top: labelY,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 6px ${strokeColor}`,
            }}
          />
        </EdgeLabelRenderer>
      )}
    </>
  )
}
