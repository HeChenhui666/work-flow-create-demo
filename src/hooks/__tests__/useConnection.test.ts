import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useConnection } from '../useConnection'
import type { Node, Connection } from '@xyflow/react'
import { NODE_DEFINITIONS } from '../../schemas/nodeDefinitions'

function makeNode(id: string, type: keyof typeof NODE_DEFINITIONS): Node {
  const def = NODE_DEFINITIONS[type]
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label: type,
      color: def.color,
      inputs: def.inputs,
      outputs: def.outputs,
      config: { ...def.defaultConfig },
    },
  }
}

function makeExtendedNode(
  id: string,
  type: string,
  inputs: { name: string; type: string }[],
  outputs: { name: string; type: string }[],
): Node {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: { label: type, color: '#000', inputs, outputs, config: {} },
  }
}

describe('useConnection', () => {
  const { result } = renderHook(() => useConnection())
  const { isValidConnection } = result.current

  const nodes: Node[] = [
    makeNode('load', 'LoadCheckpoint'),
    makeNode('clip', 'CLIPEncode'),
    makeNode('latent', 'EmptyLatent'),
    makeNode('ksampler', 'KSampler'),
    makeNode('vae', 'VAEDecode'),
  ]

  it('类型匹配的连线应被允许 (MODEL → MODEL)', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'MODEL',
      target: 'ksampler',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, nodes)).toBe(true)
  })

  it('类型匹配的连线应被允许 (CLIP → CLIP)', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'CLIP',
      target: 'clip',
      targetHandle: 'CLIP',
    }
    expect(isValidConnection(connection, nodes)).toBe(true)
  })

  it('类型匹配的连线应被允许 (LATENT → LATENT)', () => {
    const connection: Connection = {
      source: 'latent',
      sourceHandle: 'LATENT',
      target: 'ksampler',
      targetHandle: 'LATENT',
    }
    expect(isValidConnection(connection, nodes)).toBe(true)
  })

  it('类型不匹配的连线应被拒绝 (MODEL → CLIP)', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'MODEL',
      target: 'clip',
      targetHandle: 'CLIP',
    }
    expect(isValidConnection(connection, nodes)).toBe(false)
  })

  it('自连应被拒绝', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'MODEL',
      target: 'load',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, nodes)).toBe(false)
  })

  it('sourceHandle 不存在时应被拒绝', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'NONEXISTENT',
      target: 'ksampler',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, nodes)).toBe(false)
  })

  it('targetHandle 不存在时应被拒绝', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'MODEL',
      target: 'ksampler',
      targetHandle: 'NONEXISTENT',
    }
    expect(isValidConnection(connection, nodes)).toBe(false)
  })

  it('节点 ID 不存在时应被拒绝', () => {
    const connection: Connection = {
      source: 'nonexistent',
      sourceHandle: 'MODEL',
      target: 'ksampler',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, nodes)).toBe(false)
  })

  it('CONDITIONING → CONDITIONING 应被允许', () => {
    const connection: Connection = {
      source: 'clip',
      sourceHandle: 'CONDITIONING',
      target: 'ksampler',
      targetHandle: 'CONDITIONING',
    }
    expect(isValidConnection(connection, nodes)).toBe(true)
  })

  it('VAE → VAE 应被允许', () => {
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'VAE',
      target: 'vae',
      targetHandle: 'VAE',
    }
    expect(isValidConnection(connection, nodes)).toBe(true)
  })

  it('扩展节点 LoRALoader 的 MODEL 连线应被允许', () => {
    const loraNode = makeExtendedNode(
      'lora',
      'LoRALoader',
      [
        { name: 'MODEL', type: 'MODEL' },
        { name: 'CLIP', type: 'CLIP' },
      ],
      [
        { name: 'MODEL', type: 'MODEL' },
        { name: 'CLIP', type: 'CLIP' },
      ],
    )
    const allNodes = [...nodes, loraNode]
    const connection: Connection = {
      source: 'load',
      sourceHandle: 'MODEL',
      target: 'lora',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, allNodes)).toBe(true)
  })

  it('扩展节点之间类型不匹配应被拒绝', () => {
    const imageNode = makeExtendedNode('img', 'ImageLoad', [], [{ name: 'IMAGE', type: 'IMAGE' }])
    const allNodes = [...nodes, imageNode]
    const connection: Connection = {
      source: 'img',
      sourceHandle: 'IMAGE',
      target: 'ksampler',
      targetHandle: 'MODEL',
    }
    expect(isValidConnection(connection, allNodes)).toBe(false)
  })
})
