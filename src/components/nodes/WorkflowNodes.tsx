import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useViewport } from '@xyflow/react'
import { PORT_COLORS, type PortType } from '../../schemas/portRegistry'
import { NODE_TYPE_LABELS } from '../../schemas/nodeDefinitions'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useExecutionStore, type NodeStatus } from '../../stores/executionStore'
import { validateKSamplerConfig } from '../../utils/paramValidation'
import type { BaseNodeData } from './BaseNode'

const ZOOM_FAR = 0.4
const ZOOM_MID = 0.7

const HANDLE_MID = 10 // 中景视图端口圆点尺寸
const HANDLE_FULL = 14 // 近景视图端口圆点尺寸

interface WorkflowNodeProps extends NodeProps {
  data: BaseNodeData
}

/** 安全解构节点 data，所有字段提供默认值防止 undefined 崩溃 */
function safeData(data: BaseNodeData) {
  return {
    label: data.label ?? 'Node',
    color: data.color ?? '#94a3b8',
    config: (data.config ?? {}) as Record<string, unknown>,
    inputs: data.inputs ?? [],
    outputs: data.outputs ?? [],
    executing: (data.executing as boolean) ?? false,
  }
}

/** 执行中高亮动画样式 */
const executingStyle = {
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 12px rgba(59, 130, 246, 0.3)',
  animation: 'pulse-border 1s ease-in-out infinite',
}

/** 阻止所有指针事件冒泡到 ReactFlow 画布，确保表单可交互 */
const stopAllPointerEvents = (event: React.SyntheticEvent) => {
  event.stopPropagation()
  event.nativeEvent.stopImmediatePropagation()
}

/**
 * useIMEAwareInput - 支持中文输入法（IME）的受控输入 Hook
 *
 * 在 IME 组合输入期间（如拼音拼写），使用本地 state 暂存值不触发外部更新，
 * 组合结束后（onCompositionEnd）才提交最终值到外部。
 * 非 IME 输入时正常即时提交。
 */
function useIMEAwareInput(externalValue: string, onExternalChange: (value: string) => void) {
  const [localValue, setLocalValue] = useState(externalValue)
  const isComposingRef = useRef(false)

  // 当外部值变化且不在组合中时，同步到本地
  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = event.target.value
      setLocalValue(newValue)
      if (!isComposingRef.current) {
        onExternalChange(newValue)
      }
    },
    [onExternalChange],
  )

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(
    (event: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      isComposingRef.current = false
      const finalValue = event.currentTarget.value
      setLocalValue(finalValue)
      onExternalChange(finalValue)
    },
    [onExternalChange],
  )

  return {
    value: localValue,
    onChange: handleChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }
}

/** 节点执行状态角标 - 右上角悬浮状态圆点 */
export function NodeStatusBadge({ nodeId }: { nodeId: string }) {
  const status = useExecutionStore((s) => s.nodeStatuses[nodeId] ?? 'idle')
  const progress = useExecutionStore((s) => s.nodeProgresses[nodeId])

  const colors: Record<NodeStatus, string> = {
    idle: 'bg-gray-300',
    running: 'bg-blue-500 animate-pulse',
    success: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-1">
      <span className={`w-3 h-3 rounded-full ${colors[status]}`} />
      {status === 'running' && progress !== undefined && (
        <span className="text-[9px] font-mono text-blue-600 bg-white px-0.5 rounded">
          {progress}%
        </span>
      )}
    </div>
  )
}

/** 表单容器包装器 - 彻底隔离事件 */
function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="react-flow__node-input"
      onMouseDown={stopAllPointerEvents}
      onClick={stopAllPointerEvents}
      onPointerDown={stopAllPointerEvents}
      onTouchStart={stopAllPointerEvents}
      style={{ pointerEvents: 'auto', width: 'max-content' }}
    >
      {children}
    </div>
  )
}

/**
 * LoadCheckpoint 节点 - 加载模型检查点
 * 输出: MODEL, CLIP, VAE
 */
export const LoadCheckpointNode = memo(function LoadCheckpointNode({
  data,
  id,
}: WorkflowNodeProps) {
  const { zoom } = useViewport()
  const { updateNodeData } = useWorkflowStore()
  const { label, color, config, outputs, executing } = safeData(data)

  const displayLabel = NODE_TYPE_LABELS.LoadCheckpoint || label

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: color }}
      >
        LCP
      </div>
    )
  }

  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{displayLabel}</div>
        {outputs.map((output) => (
          <Handle
            key={`${id}-out-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="nowheel relative w-full rounded-lg border-2 bg-white p-3 shadow-md transition-opacity duration-100"
      style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
    >
      <NodeStatusBadge nodeId={id} />
      <div className="mb-2 text-sm font-bold text-gray-900 truncate">{displayLabel}</div>
      <FormContainer>
        <div className="space-y-2">
          <label className="block text-xs text-gray-500">模型</label>
          <select
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs truncate"
            value={(config.modelName as string) || ''}
            onChange={(e) => handleConfigChange('modelName', e.target.value)}
          >
            <option value="">选择模型...</option>
            <option value="sd_xl_base_1.0.safetensors">SDXL Base 1.0</option>
            <option value="v1-5-pruned-emaonly.ckpt">SD 1.5</option>
            <option value="dreamshaper_8.safetensors">DreamShaper 8</option>
          </select>
        </div>
      </FormContainer>
      {outputs.map((output, index) => (
        <Handle
          key={`${id}-out-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{
            backgroundColor: PORT_COLORS[output.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
            top: `${((index + 1) / (outputs.length + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  )
})

/**
 * CLIPEncode 节点 - 文本编码
 * 输入: CLIP | 输出: CONDITIONING
 */
export const CLIPEncodeNode = memo(function CLIPEncodeNode({ data, id }: WorkflowNodeProps) {
  const { zoom } = useViewport()
  const { updateNodeData } = useWorkflowStore()
  const { label, color, config, inputs, outputs, executing } = safeData(data)

  const displayLabel = NODE_TYPE_LABELS.CLIPEncode || label

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  // IME-aware inputs for Chinese text input
  const positivePromptInput = useIMEAwareInput(
    (config.positivePrompt as string) || '',
    useCallback(
      (value: string) => handleConfigChange('positivePrompt', value),
      [handleConfigChange],
    ),
  )
  const negativePromptInput = useIMEAwareInput(
    (config.negativePrompt as string) || '',
    useCallback(
      (value: string) => handleConfigChange('negativePrompt', value),
      [handleConfigChange],
    ),
  )

  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: color }}
      >
        CLP
      </div>
    )
  }

  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{displayLabel}</div>
        {inputs.map((input) => (
          <Handle
            key={`${id}-in-${input.name}`}
            type="target"
            position={Position.Left}
            id={input.name}
            style={{
              backgroundColor: PORT_COLORS[input.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
        {outputs.map((output) => (
          <Handle
            key={`${id}-out-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="nowheel relative w-full rounded-lg border-2 bg-white p-3 shadow-md transition-opacity duration-100"
      style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
    >
      <NodeStatusBadge nodeId={id} />
      <div className="mb-2 text-sm font-bold text-gray-900 truncate">{displayLabel}</div>
      <FormContainer>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-500">正向提示词</label>
            <textarea
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              rows={2}
              value={positivePromptInput.value}
              onChange={positivePromptInput.onChange}
              onCompositionStart={positivePromptInput.onCompositionStart}
              onCompositionEnd={positivePromptInput.onCompositionEnd}
              placeholder="描述你想生成的图像..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">反向提示词</label>
            <textarea
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              rows={1}
              value={negativePromptInput.value}
              onChange={negativePromptInput.onChange}
              onCompositionStart={negativePromptInput.onCompositionStart}
              onCompositionEnd={negativePromptInput.onCompositionEnd}
              placeholder="不希望出现的元素..."
            />
          </div>
        </div>
      </FormContainer>
      {inputs.map((input) => (
        <Handle
          key={`${id}-in-${input.name}`}
          type="target"
          position={Position.Left}
          id={input.name}
          style={{
            backgroundColor: PORT_COLORS[input.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
          }}
        />
      ))}
      {outputs.map((output) => (
        <Handle
          key={`${id}-out-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{
            backgroundColor: PORT_COLORS[output.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
          }}
        />
      ))}
    </div>
  )
})

/**
 * EmptyLatent 节点 - 生成空白潜空间图像
 * 输出: LATENT
 */
export const EmptyLatentNode = memo(function EmptyLatentNode({ data, id }: WorkflowNodeProps) {
  const { zoom } = useViewport()
  const { updateNodeData } = useWorkflowStore()
  const { label, color, config, outputs, executing } = safeData(data)

  const displayLabel = NODE_TYPE_LABELS.EmptyLatent || label

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: color }}
      >
        LAT
      </div>
    )
  }

  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{displayLabel}</div>
        {outputs.map((output) => (
          <Handle
            key={`${id}-out-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="nowheel relative w-full rounded-lg border-2 bg-white p-3 shadow-md transition-opacity duration-100"
      style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
    >
      <NodeStatusBadge nodeId={id} />
      <div className="mb-2 text-sm font-bold text-gray-900 truncate">{displayLabel}</div>
      <FormContainer>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">宽度</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.width as number) ?? 512}
              onChange={(e) => handleConfigChange('width', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">高度</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.height as number) ?? 512}
              onChange={(e) => handleConfigChange('height', Number(e.target.value))}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500">批次大小</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.batchSize as number) ?? 1}
              min={1}
              max={16}
              onChange={(e) => handleConfigChange('batchSize', Number(e.target.value))}
            />
          </div>
        </div>
      </FormContainer>
      {outputs.map((output) => (
        <Handle
          key={`${id}-out-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{
            backgroundColor: PORT_COLORS[output.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
          }}
        />
      ))}
    </div>
  )
})

/**
 * KSampler 预设配置
 */
const KSAMPLER_PRESETS = [
  { name: '快速草图', steps: 10, cfg: 5.0, sampler: 'euler', scheduler: 'normal' },
  { name: '标准质量', steps: 20, cfg: 7.0, sampler: 'euler_a', scheduler: 'karras' },
  { name: '精细出图', steps: 50, cfg: 7.5, sampler: 'dpmpp_2m', scheduler: 'karras' },
] as const

/**
 * KSampler 节点 - 采样器核心
 * 输入: MODEL, CONDITIONING, LATENT | 输出: LATENT
 */
export const KSamplerNode = memo(function KSamplerNode({ data, id }: WorkflowNodeProps) {
  const { zoom } = useViewport()
  const { updateNodeData } = useWorkflowStore()
  const { label, color, config, inputs, outputs, executing } = safeData(data)

  const displayLabel = NODE_TYPE_LABELS.KSampler || label

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  // Hooks 必须在所有条件返回之前调用
  const kSamplerProgress = useExecutionStore((s) => s.nodeProgresses[id])
  const kSamplerStatus = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: color }}
      >
        KSM
      </div>
    )
  }

  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{displayLabel}</div>
        {inputs.map((input, index) => (
          <Handle
            key={`${id}-in-${input.name}`}
            type="target"
            position={Position.Left}
            id={input.name}
            style={{
              backgroundColor: PORT_COLORS[input.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
              top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
            }}
          />
        ))}
        {outputs.map((output) => (
          <Handle
            key={`${id}-out-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="nowheel relative w-full rounded-lg border-2 bg-white p-3 shadow-md transition-opacity duration-100"
      style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
    >
      <NodeStatusBadge nodeId={id} />
      <div className="mb-2 text-sm font-bold text-gray-900 truncate">{displayLabel}</div>
      {kSamplerStatus === 'running' && kSamplerProgress !== undefined && (
        <div className="mb-2 mx-0">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${kSamplerProgress}%` }}
            />
          </div>
          <div className="text-[10px] text-blue-500 mt-0.5 text-right">{kSamplerProgress}%</div>
        </div>
      )}
      <FormContainer>
        {/* 预设下拉 */}
        <select
          className="w-full text-xs border border-gray-200 rounded px-1 py-0.5 mb-2"
          value={selectedPreset}
          onChange={(e) => {
            const index = Number(e.target.value)
            const preset = KSAMPLER_PRESETS[index]
            if (!preset) return
            setSelectedPreset(e.target.value)
            updateNodeData(id, {
              config: {
                ...config,
                steps: preset.steps,
                cfg: preset.cfg,
                sampler: preset.sampler,
                scheduler: preset.scheduler,
              },
            })
          }}
        >
          <option value="" disabled>
            选择预设...
          </option>
          {KSAMPLER_PRESETS.map((preset, index) => (
            <option key={preset.name} value={String(index)}>
              {preset.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">步数</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.steps as number) ?? 20}
              min={1}
              max={150}
              onChange={(e) => handleConfigChange('steps', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">CFG</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.cfg as number) ?? 7}
              step={0.5}
              onChange={(e) => handleConfigChange('cfg', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">采样器</label>
            <select
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.sampler as string) || 'euler'}
              onChange={(e) => handleConfigChange('sampler', e.target.value)}
            >
              <option value="euler">Euler</option>
              <option value="euler_a">Euler Ancestral</option>
              <option value="heun">Heun</option>
              <option value="dpmpp_2m">DPM++ 2M</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">调度器</label>
            <select
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              value={(config.scheduler as string) || 'karras'}
              onChange={(e) => handleConfigChange('scheduler', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="karras">Karras</option>
              <option value="exponential">Exponential</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500">种子</label>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                value={(config.seed as number) ?? -1}
                onChange={(e) => handleConfigChange('seed', Number(e.target.value))}
              />
              <button
                title="随机种子"
                onClick={() => handleConfigChange('seed', Math.floor(Math.random() * 2 ** 32))}
                className="text-xs px-1.5 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                🎲
              </button>
              <button
                title="复制种子"
                onClick={() => navigator.clipboard.writeText(String((config.seed as number) ?? -1))}
                className="text-xs px-1.5 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* 验证警告 */}
        {validateKSamplerConfig({
          steps: (config.steps as number) ?? 20,
          cfg: (config.cfg as number) ?? 7,
        }).map((warning, index) => (
          <div key={index} className="text-[10px] text-amber-600 flex items-start gap-1 mt-1">
            <span>⚠️</span>
            <span>{warning}</span>
          </div>
        ))}
      </FormContainer>
      {inputs.map((input, index) => (
        <Handle
          key={`${id}-in-${input.name}`}
          type="target"
          position={Position.Left}
          id={input.name}
          style={{
            backgroundColor: PORT_COLORS[input.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
            top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
          }}
        />
      ))}
      {outputs.map((output) => (
        <Handle
          key={`${id}-out-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{
            backgroundColor: PORT_COLORS[output.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
          }}
        />
      ))}
    </div>
  )
})

/**
 * VAEDecode 节点 - 潜空间解码为图像
 * 输入: LATENT, VAE | 输出: IMAGE
 */
export const VAEDecodeNode = memo(function VAEDecodeNode({ data, id }: WorkflowNodeProps) {
  const { zoom } = useViewport()
  const { label, color, inputs, outputs, executing } = safeData(data)

  const displayLabel = NODE_TYPE_LABELS.VAEDecode || label

  if (zoom < ZOOM_FAR) {
    return (
      <div
        className="flex h-12 w-24 items-center justify-center rounded text-xs font-bold text-white transition-opacity duration-100"
        style={{ backgroundColor: color }}
      >
        VAE
      </div>
    )
  }

  if (zoom < ZOOM_MID) {
    return (
      <div
        className="relative flex min-w-[160px] flex-col rounded-lg border-2 bg-white p-2 shadow-sm transition-opacity duration-100"
        style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
      >
        <div className="mb-1 text-xs font-semibold text-gray-800">{displayLabel}</div>
        {inputs.map((input, index) => (
          <Handle
            key={`${id}-in-${input.name}`}
            type="target"
            position={Position.Left}
            id={input.name}
            style={{
              backgroundColor: PORT_COLORS[input.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
              top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
            }}
          />
        ))}
        {outputs.map((output) => (
          <Handle
            key={`${id}-out-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{
              backgroundColor: PORT_COLORS[output.type as PortType],
              width: HANDLE_MID,
              height: HANDLE_MID,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="relative w-full rounded-lg border-2 bg-white p-3 shadow-md transition-opacity duration-100"
      style={{ borderColor: color, ...(executing ? executingStyle : {}) }}
    >
      <NodeStatusBadge nodeId={id} />
      <div className="mb-2 text-sm font-bold text-gray-900 truncate">{displayLabel}</div>
      <div className="text-xs text-gray-400">将潜空间数据解码为像素图像</div>
      {inputs.map((input, index) => (
        <Handle
          key={`${id}-in-${input.name}`}
          type="target"
          position={Position.Left}
          id={input.name}
          style={{
            backgroundColor: PORT_COLORS[input.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
            top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
          }}
        />
      ))}
      {outputs.map((output) => (
        <Handle
          key={`${id}-out-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{
            backgroundColor: PORT_COLORS[output.type as PortType],
            width: HANDLE_FULL,
            height: HANDLE_FULL,
          }}
        />
      ))}
    </div>
  )
})
