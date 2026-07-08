import { useMemo } from 'react'
import { useWorkflowStore } from '../stores/workflowStore'
import { NODE_TYPE_LABELS, PORT_TYPE_LABELS } from '../schemas/nodeDefinitions'
import { PORT_COLORS } from '../schemas/portRegistry'

/**
 * PropertyInspector - 属性面板组件
 *
 * 显示当前选中节点的详细配置信息。
 * 通过 workflowStore.selectedNodeId 获取选中节点。
 */
export function PropertyInspector() {
  const { nodes, selectedNodeId } = useWorkflowStore()

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    return nodes.find((n) => n.id === selectedNodeId) || null
  }, [nodes, selectedNodeId])

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col p-3">
        <h3 className="mb-2 text-xs font-semibold text-gray-700">属性面板</h3>
        <p className="text-xs text-gray-400">点击节点查看属性</p>
      </div>
    )
  }

  const nodeType = selectedNode.type as string
  const displayLabel = NODE_TYPE_LABELS[nodeType as keyof typeof NODE_TYPE_LABELS] || nodeType
  const data = selectedNode.data as Record<string, unknown>
  const config = (data.config as Record<string, unknown>) || {}
  const inputs = (data.inputs as Array<{ name: string; type: string; label?: string }>) || []
  const outputs = (data.outputs as Array<{ name: string; type: string; label?: string }>) || []

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      <h3 className="mb-3 text-xs font-semibold text-gray-700">属性面板</h3>

      {/* 节点基本信息 */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: (data.color as string) || '#94a3b8' }}
          />
          <span className="text-sm font-medium text-gray-900">{displayLabel}</span>
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          <div>
            ID: <span className="font-mono text-gray-700">{selectedNode.id}</span>
          </div>
          <div>
            位置: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
          </div>
        </div>
      </div>

      {/* 输入端口 */}
      {inputs.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold text-gray-600">输入端口</h4>
          <div className="space-y-1">
            {inputs.map((input) => (
              <div
                key={input.name}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PORT_COLORS[input.type as keyof typeof PORT_COLORS] }}
                />
                <span className="text-xs text-gray-700">
                  {input.label ||
                    PORT_TYPE_LABELS[input.type as keyof typeof PORT_TYPE_LABELS] ||
                    input.name}
                </span>
                <span className="ml-auto text-[10px] text-gray-400">{input.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 输出端口 */}
      {outputs.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold text-gray-600">输出端口</h4>
          <div className="space-y-1">
            {outputs.map((output) => (
              <div
                key={output.name}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PORT_COLORS[output.type as keyof typeof PORT_COLORS] }}
                />
                <span className="text-xs text-gray-700">
                  {output.label ||
                    PORT_TYPE_LABELS[output.type as keyof typeof PORT_TYPE_LABELS] ||
                    output.name}
                </span>
                <span className="ml-auto text-[10px] text-gray-400">{output.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配置项 */}
      {Object.keys(config).length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold text-gray-600">配置项</h4>
          <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between text-xs">
                <span className="text-gray-500">{key}:</span>
                <span
                  className="max-w-[120px] truncate text-right font-mono text-gray-700"
                  title={String(value)}
                >
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
