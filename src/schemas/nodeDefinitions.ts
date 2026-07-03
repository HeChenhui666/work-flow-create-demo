import type { PortType } from './portRegistry'

export interface PortDef {
  name: string
  type: PortType
}

export interface NodeDef {
  inputs: PortDef[]
  outputs: PortDef[]
  defaultConfig: Record<string, unknown>
  color: string
}

export const NODE_TYPES = [
  'LoadCheckpoint',
  'CLIPEncode',
  'EmptyLatent',
  'KSampler',
  'VAEDecode',
] as const

export type NodeType = typeof NODE_TYPES[number]

export const NODE_DEFINITIONS: Record<NodeType, NodeDef> = {
  LoadCheckpoint: {
    inputs: [],
    outputs: [
      { name: 'MODEL', type: 'MODEL' },
      { name: 'CLIP',  type: 'CLIP'  },
      { name: 'VAE',   type: 'VAE'   },
    ],
    defaultConfig: { modelName: '' },
    color: '#a855f7',
  },
  CLIPEncode: {
    inputs:  [{ name: 'CLIP', type: 'CLIP' }],
    outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING' }],
    defaultConfig: { positivePrompt: '', negativePrompt: '' },
    color: '#22c55e',
  },
  EmptyLatent: {
    inputs:  [],
    outputs: [{ name: 'LATENT', type: 'LATENT' }],
    defaultConfig: { width: 512, height: 512, batchSize: 1 },
    color: '#6b7280',
  },
  KSampler: {
    inputs: [
      { name: 'MODEL',        type: 'MODEL'        },
      { name: 'CONDITIONING', type: 'CONDITIONING' },
      { name: 'LATENT',       type: 'LATENT'       },
    ],
    outputs: [{ name: 'LATENT', type: 'LATENT' }],
    defaultConfig: { steps: 20, cfg: 7, sampler: 'euler', scheduler: 'karras', seed: 42 },
    color: '#3b82f6',
  },
  VAEDecode: {
    inputs: [
      { name: 'LATENT', type: 'LATENT' },
      { name: 'VAE',    type: 'VAE'    },
    ],
    outputs: [{ name: 'IMAGE', type: 'IMAGE' }],
    defaultConfig: {},
    color: '#f97316',
  },
}
