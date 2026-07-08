import { describe, it, expect } from 'vitest'
import {
  LoadCheckpointNode,
  CLIPEncodeNode,
  EmptyLatentNode,
  KSamplerNode,
  VAEDecodeNode,
} from '../WorkflowNodes'

describe('WorkflowNodes', () => {
  it('LoadCheckpointNode 应被正确导出', () => {
    expect(LoadCheckpointNode).toBeDefined()
    expect(typeof LoadCheckpointNode).toBe('object') // memo 返回对象
  })

  it('CLIPEncodeNode 应被正确导出', () => {
    expect(CLIPEncodeNode).toBeDefined()
    expect(typeof CLIPEncodeNode).toBe('object')
  })

  it('EmptyLatentNode 应被正确导出', () => {
    expect(EmptyLatentNode).toBeDefined()
    expect(typeof EmptyLatentNode).toBe('object')
  })

  it('KSamplerNode 应被正确导出', () => {
    expect(KSamplerNode).toBeDefined()
    expect(typeof KSamplerNode).toBe('object')
  })

  it('VAEDecodeNode 应被正确导出', () => {
    expect(VAEDecodeNode).toBeDefined()
    expect(typeof VAEDecodeNode).toBe('object')
  })
})
