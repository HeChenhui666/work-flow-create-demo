import { useCallback, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeStatusBadge } from './WorkflowNodes'
import { useWorkflowStore } from '../../stores/workflowStore'

export function LoRALoaderNode({ id, data }: NodeProps) {
  const nodeData = data as Record<string, unknown>
  return (
    <div className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm" style={{ borderColor: '#8b5cf6' }}>
      <NodeStatusBadge nodeId={id} />
      <div className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate" style={{ backgroundColor: '#8b5cf6' }}>
        LoRA Loader
      </div>
      <Handle type="target" position={Position.Left} id="MODEL" style={{ top: '38%' }} />
      <Handle type="target" position={Position.Left} id="CLIP" style={{ top: '62%' }} />
      <div className="px-3 py-2 text-xs text-gray-600 space-y-1">
        <div className="truncate">LoRA: <span className="text-gray-400">{String(nodeData.loraName ?? 'example.safetensors')}</span></div>
        <div>强度: <span className="text-gray-400">{String(nodeData.strength ?? 1.0)}</span></div>
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

  const imagePreview = (nodeData.config as Record<string, unknown>)?.imagePreview as string | undefined

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith('image/'),
    )
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
  }, [id, nodeData.config, updateNodeData])

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
    <div className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm" style={{ borderColor: '#f97316' }}>
      <NodeStatusBadge nodeId={id} />
      <div className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate" style={{ backgroundColor: '#f97316' }}>
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
          <img
            src={imagePreview}
            alt="loaded"
            className="w-full h-20 object-cover rounded"
          />
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

export function ImagePreviewNode({ id, data }: NodeProps) {
  const nodeData = data as Record<string, unknown>
  return (
    <div className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm" style={{ borderColor: '#f97316' }}>
      <NodeStatusBadge nodeId={id} />
      <Handle type="target" position={Position.Left} id="IMAGE" />
      <div className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate" style={{ backgroundColor: '#f97316' }}>
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
  return (
    <div className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm" style={{ borderColor: '#06b6d4' }}>
      <NodeStatusBadge nodeId={id} />
      <Handle type="target" position={Position.Left} id="IMAGE" />
      <div className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate" style={{ backgroundColor: '#06b6d4' }}>
        放大器
      </div>
      <div className="px-3 py-2 text-xs text-gray-600 space-y-1">
        <div>倍率: <span className="text-gray-400">{String(nodeData.scale ?? 2)}x</span></div>
        <div className="truncate">模型: <span className="text-gray-400">{String(nodeData.model ?? 'RealESRGAN')}</span></div>
      </div>
      <Handle type="source" position={Position.Right} id="IMAGE" />
    </div>
  )
}
