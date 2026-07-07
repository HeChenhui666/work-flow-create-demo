import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeStatusBadge } from './WorkflowNodes'

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
  return (
      <div className="nowheel relative w-full bg-white rounded-lg border-2 shadow-sm" style={{ borderColor: '#f97316' }}>
        <NodeStatusBadge nodeId={id} />
        <div className="px-3 py-1.5 rounded-t-md text-white text-xs font-semibold truncate" style={{ backgroundColor: '#f97316' }}>
          图像加载
        </div>
        <div className="px-3 py-2 text-xs text-gray-400">拖放图片到此处</div>
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
