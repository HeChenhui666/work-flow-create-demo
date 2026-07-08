import { useCallback, useMemo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeStatusBadge } from './WorkflowNodes'
import { useWorkflowStore } from '../../stores/workflowStore'

export function LoRALoaderNode({ id, data }: NodeProps) {
  const nodeData = data as Record<string, unknown>
  const { updateNodeData } = useWorkflowStore()
  const config = useMemo(
    () => (nodeData.config as Record<string, unknown>) ?? {},
    [nodeData.config],
  )

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  return (
    <div
      className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm"
      style={{ borderColor: '#8b5cf6' }}
    >
      <NodeStatusBadge nodeId={id} />
      <div
        className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate"
        style={{ backgroundColor: '#8b5cf6' }}
      >
        LoRA Loader
      </div>
      <Handle type="target" position={Position.Left} id="MODEL" style={{ top: '38%' }} />
      <Handle type="target" position={Position.Left} id="CLIP" style={{ top: '62%' }} />
      <div
        className="px-3 py-2 text-xs text-gray-600 space-y-2"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">LoRA 模型</label>
          <select
            className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs"
            value={(config.loraName as string) ?? 'example.safetensors'}
            onChange={(e) => handleConfigChange('loraName', e.target.value)}
          >
            <option value="example.safetensors">example.safetensors</option>
            <option value="detail_tweaker.safetensors">Detail Tweaker</option>
            <option value="add_detail.safetensors">Add Detail</option>
            <option value="epi_noiseoffset.safetensors">Noise Offset</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">强度</label>
          <input
            type="number"
            className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs"
            value={(config.strength as number) ?? 1.0}
            min={0}
            max={2}
            step={0.1}
            onChange={(e) => handleConfigChange('strength', Number(e.target.value))}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="MODEL" style={{ top: '38%' }} />
      <Handle type="source" position={Position.Right} id="CLIP" style={{ top: '62%' }} />
    </div>
  )
}

export function ImageLoadNode({ id, data }: NodeProps) {
  const nodeData = data as Record<string, unknown>
  const { updateNodeData } = useWorkflowStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const imagePreview = (nodeData.config as Record<string, unknown>)?.imagePreview as
    string | undefined

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
      if (!file) return

      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        updateNodeData(id, {
          config: {
            ...((nodeData.config as Record<string, unknown>) ?? {}),
            imagePath: file.name,
            imagePreview: dataUrl,
          },
        })
      }
      reader.readAsDataURL(file)
    },
    [id, nodeData.config, updateNodeData],
  )

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        updateNodeData(id, {
          config: {
            ...((nodeData.config as Record<string, unknown>) ?? {}),
            imagePath: file.name,
            imagePreview: dataUrl,
          },
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [id, nodeData.config, updateNodeData])

  return (
    <div
      className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm"
      style={{ borderColor: '#f97316' }}
    >
      <NodeStatusBadge nodeId={id} />
      <div
        className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate"
        style={{ backgroundColor: '#f97316' }}
      >
        图像加载
      </div>
      <div
        className={`mx-2 my-2 rounded border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="loaded" className="w-full h-20 object-cover rounded" />
        ) : (
          <div className="flex flex-col items-center justify-center py-3 px-2">
            <span className="text-gray-300 text-lg">🖼️</span>
            <span className="text-[10px] text-gray-400 mt-1">拖放图片或点击选择</span>
          </div>
        )}
      </div>
      {imagePreview && (
        <div className="px-2 pb-1.5 text-[10px] text-gray-500 truncate">
          {((nodeData.config as Record<string, unknown>)?.imagePath as string) ?? ''}
        </div>
      )}
      <Handle type="source" position={Position.Right} id="IMAGE" />
    </div>
  )
}

export function ImagePreviewNode({ id }: NodeProps) {
  return (
    <div
      className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm"
      style={{ borderColor: '#f97316' }}
    >
      <NodeStatusBadge nodeId={id} />
      <Handle type="target" position={Position.Left} id="IMAGE" />
      <div
        className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate"
        style={{ backgroundColor: '#f97316' }}
      >
        图像预览
      </div>
      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-300 text-xs">预览区域</span>
      </div>
      <Handle type="source" position={Position.Right} id="IMAGE" />
    </div>
  )
}

export function UpscalerNode({ id, data }: NodeProps) {
  const nodeData = data as Record<string, unknown>
  const { updateNodeData } = useWorkflowStore()
  const config = useMemo(
    () => (nodeData.config as Record<string, unknown>) ?? {},
    [nodeData.config],
  )

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, { config: { ...config, [key]: value } })
    },
    [id, config, updateNodeData],
  )

  return (
    <div
      className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm"
      style={{ borderColor: '#06b6d4' }}
    >
      <NodeStatusBadge nodeId={id} />
      <Handle type="target" position={Position.Left} id="IMAGE" />
      <div
        className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate"
        style={{ backgroundColor: '#06b6d4' }}
      >
        放大器
      </div>
      <div
        className="px-3 py-2 text-xs text-gray-600 space-y-2"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">放大倍率</label>
          <select
            className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs"
            value={(config.scale as number) ?? 2}
            onChange={(e) => handleConfigChange('scale', Number(e.target.value))}
          >
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">放大模型</label>
          <select
            className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs"
            value={(config.model as string) ?? 'RealESRGAN_x4plus'}
            onChange={(e) => handleConfigChange('model', e.target.value)}
          >
            <option value="RealESRGAN_x4plus">RealESRGAN x4plus</option>
            <option value="RealESRGAN_x4plus_anime">RealESRGAN Anime</option>
            <option value="ESRGAN_4x">ESRGAN 4x</option>
            <option value="SwinIR_4x">SwinIR 4x</option>
          </select>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="IMAGE" />
    </div>
  )
}
