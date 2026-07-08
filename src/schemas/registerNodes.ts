import { nodeRegistry } from './nodeRegistry'
import { NODE_DEFINITIONS } from './nodeDefinitions'

for (const [type, def] of Object.entries(NODE_DEFINITIONS)) {
  nodeRegistry.register({
    type,
    label: def.label ?? type,
    color: def.color,
    category: getCategoryForType(type),
    inputs: def.inputs,
    outputs: def.outputs,
    defaultConfig: def.defaultConfig,
    tags: [],
  })
}

// 扩展节点注册
nodeRegistry.register({
  type: 'LoRALoader',
  label: 'LoRA Loader',
  color: '#8b5cf6',
  category: 'model',
  inputs: [
    { name: 'MODEL', type: 'MODEL' },
    { name: 'CLIP', type: 'CLIP' },
  ],
  outputs: [
    { name: 'MODEL', type: 'MODEL' },
    { name: 'CLIP', type: 'CLIP' },
  ],
  defaultConfig: { loraName: 'example.safetensors', strength: 1.0 },
})

nodeRegistry.register({
  type: 'ImageLoad',
  label: '图像加载',
  color: '#f97316',
  category: 'tool',
  inputs: [],
  outputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  defaultConfig: { imagePath: '' },
})

nodeRegistry.register({
  type: 'ImagePreview',
  label: '图像预览',
  color: '#f97316',
  category: 'tool',
  inputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  outputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  defaultConfig: {},
})

nodeRegistry.register({
  type: 'Upscaler',
  label: '放大器',
  color: '#06b6d4',
  category: 'tool',
  inputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  outputs: [{ name: 'IMAGE', type: 'IMAGE' }],
  defaultConfig: { scale: 2, model: 'RealESRGAN_x4plus' },
})

function getCategoryForType(type: string): string {
  switch (type) {
    case 'LoadCheckpoint':
      return 'model'
    case 'CLIPEncode':
      return 'encode'
    case 'KSampler':
      return 'sampler'
    case 'VAEDecode':
      return 'decode'
    case 'EmptyLatent':
      return 'tool'
    default:
      return 'general'
  }
}
