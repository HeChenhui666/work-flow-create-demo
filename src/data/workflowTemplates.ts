import type { Node, Edge } from '@xyflow/react'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'txt2img-basic',
    name: '文生图基础',
    description: 'LoadCheckpoint → CLIPEncode → EmptyLatent → KSampler → VAEDecode',
    nodes: [
      { id: 't-n1', type: 'LoadCheckpoint', position: { x: 0, y: 100 }, data: { label: 'LoadCheckpoint', color: '#a855f7', inputs: [], outputs: [{ name: 'MODEL', type: 'MODEL' }, { name: 'CLIP', type: 'CLIP' }, { name: 'VAE', type: 'VAE' }], config: { ckptName: 'v1-5-pruned.safetensors' } } },
      { id: 't-n2', type: 'CLIPEncode', position: { x: 280, y: 0 }, data: { label: 'CLIPEncode', color: '#22c55e', inputs: [{ name: 'CLIP', type: 'CLIP' }], outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING' }], config: { text: 'a beautiful landscape' } } },
      { id: 't-n3', type: 'EmptyLatent', position: { x: 280, y: 200 }, data: { label: 'EmptyLatent', color: '#6b7280', inputs: [], outputs: [{ name: 'LATENT', type: 'LATENT' }], config: { width: 512, height: 512, batchSize: 1 } } },
      { id: 't-n4', type: 'KSampler', position: { x: 560, y: 100 }, data: { label: 'KSampler', color: '#eab308', inputs: [{ name: 'MODEL', type: 'MODEL' }, { name: 'CONDITIONING', type: 'CONDITIONING' }, { name: 'LATENT', type: 'LATENT' }], outputs: [{ name: 'LATENT', type: 'LATENT' }], config: { seed: -1, steps: 20, cfg: 7, sampler: 'euler_a', scheduler: 'karras' } } },
      { id: 't-n5', type: 'VAEDecode', position: { x: 840, y: 100 }, data: { label: 'VAEDecode', color: '#ef4444', inputs: [{ name: 'LATENT', type: 'LATENT' }, { name: 'VAE', type: 'VAE' }], outputs: [{ name: 'IMAGE', type: 'IMAGE' }], config: {} } },
    ],
    edges: [
      { id: 'te1', source: 't-n1', sourceHandle: 'MODEL', target: 't-n4', targetHandle: 'MODEL', type: 'typed', data: { sourceHandle: 'MODEL' } },
      { id: 'te2', source: 't-n1', sourceHandle: 'CLIP', target: 't-n2', targetHandle: 'CLIP', type: 'typed', data: { sourceHandle: 'CLIP' } },
      { id: 'te3', source: 't-n1', sourceHandle: 'VAE', target: 't-n5', targetHandle: 'VAE', type: 'typed', data: { sourceHandle: 'VAE' } },
      { id: 'te4', source: 't-n2', sourceHandle: 'CONDITIONING', target: 't-n4', targetHandle: 'CONDITIONING', type: 'typed', data: { sourceHandle: 'CONDITIONING' } },
      { id: 'te5', source: 't-n3', sourceHandle: 'LATENT', target: 't-n4', targetHandle: 'LATENT', type: 'typed', data: { sourceHandle: 'LATENT' } },
      { id: 'te6', source: 't-n4', sourceHandle: 'LATENT', target: 't-n5', targetHandle: 'LATENT', type: 'typed', data: { sourceHandle: 'LATENT' } },
    ],
  },
]
