import type { PortType } from './portRegistry'

export interface PortDef {
  name: string
  type: PortType
  label?: string
}

export interface NodeDef {
  inputs: PortDef[]
  outputs: PortDef[]
  defaultConfig: Record<string, unknown>
  color: string
  label: string
}

export const NODE_TYPES = [
  'LoadCheckpoint',
  'CLIPEncode',
  'EmptyLatent',
  'KSampler',
  'VAEDecode',
] as const

export type NodeType = (typeof NODE_TYPES)[number]

/** 节点类型中文名称映射 */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  LoadCheckpoint: '加载模型',
  CLIPEncode: '文本编码',
  EmptyLatent: '空白潜空间',
  KSampler: '采样器',
  VAEDecode: 'VAE 解码',
}

/** 端口类型中文标签映射 */
export const PORT_TYPE_LABELS: Record<PortType, string> = {
  MODEL: '模型',
  CLIP: 'CLIP',
  VAE: 'VAE',
  CONDITIONING: '条件',
  LATENT: '潜空间',
  IMAGE: '图像',
}

export const NODE_DEFINITIONS: Record<NodeType, NodeDef> = {
  LoadCheckpoint: {
    inputs: [],
    outputs: [
      { name: 'MODEL', type: 'MODEL', label: '模型' },
      { name: 'CLIP', type: 'CLIP', label: 'CLIP' },
      { name: 'VAE', type: 'VAE', label: 'VAE' },
    ],
    defaultConfig: { modelName: '' },
    color: '#a855f7',
    label: '加载模型',
  },
  CLIPEncode: {
    inputs: [{ name: 'CLIP', type: 'CLIP', label: 'CLIP' }],
    outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING', label: '条件' }],
    defaultConfig: { positivePrompt: '', negativePrompt: '' },
    color: '#22c55e',
    label: '文本编码',
  },
  EmptyLatent: {
    inputs: [],
    outputs: [{ name: 'LATENT', type: 'LATENT', label: '潜空间' }],
    defaultConfig: { width: 512, height: 512, batchSize: 1 },
    color: '#6b7280',
    label: '空白潜空间',
  },
  KSampler: {
    inputs: [
      { name: 'MODEL', type: 'MODEL', label: '模型' },
      { name: 'CONDITIONING', type: 'CONDITIONING', label: '条件' },
      { name: 'LATENT', type: 'LATENT', label: '潜空间' },
    ],
    outputs: [{ name: 'LATENT', type: 'LATENT', label: '潜空间' }],
    defaultConfig: { steps: 20, cfg: 7, sampler: 'euler', scheduler: 'karras', seed: 42 },
    color: '#3b82f6',
    label: '采样器',
  },
  VAEDecode: {
    inputs: [
      { name: 'LATENT', type: 'LATENT', label: '潜空间' },
      { name: 'VAE', type: 'VAE', label: 'VAE' },
    ],
    outputs: [{ name: 'IMAGE', type: 'IMAGE', label: '图像' }],
    defaultConfig: {},
    color: '#f97316',
    label: 'VAE 解码',
  },
}
