import { describe, it, expect, beforeEach } from 'vitest'
import { NodeRegistry } from '../nodeRegistry'

describe('NodeRegistry', () => {
  let registry: NodeRegistry

  beforeEach(() => {
    registry = new NodeRegistry()
  })

  it('register 后 get 返回注册的定义', () => {
    registry.register({
      type: 'TestNode',
      label: 'Test',
      color: '#fff',
      category: 'test',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    expect(registry.get('TestNode')?.label).toBe('Test')
  })

  it('getAll 返回所有注册节点', () => {
    registry.register({
      type: 'A',
      label: 'A',
      color: '#fff',
      category: 'c',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    registry.register({
      type: 'B',
      label: 'B',
      color: '#fff',
      category: 'c',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    expect(Object.keys(registry.getAll())).toHaveLength(2)
  })

  it('get 未注册节点返回 undefined', () => {
    expect(registry.get('Unknown')).toBeUndefined()
  })

  it('getByCategory 按分类过滤', () => {
    registry.register({
      type: 'A',
      label: 'A',
      color: '#fff',
      category: 'model',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    registry.register({
      type: 'B',
      label: 'B',
      color: '#fff',
      category: 'sampler',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    expect(registry.getByCategory('model')).toHaveLength(1)
  })

  it('getTypes 返回所有已注册类型名', () => {
    registry.register({
      type: 'X',
      label: 'X',
      color: '#fff',
      category: 'c',
      inputs: [],
      outputs: [],
      defaultConfig: {},
    })
    expect(registry.getTypes()).toContain('X')
  })
})
