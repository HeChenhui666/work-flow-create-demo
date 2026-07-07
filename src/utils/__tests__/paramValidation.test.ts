import { describe, it, expect } from 'vitest'
import { validateKSamplerConfig } from '../paramValidation'

describe('validateKSamplerConfig', () => {
  it('steps < 5 返回警告', () => {
    const warns = validateKSamplerConfig({ steps: 3, cfg: 7 })
    expect(warns.some((w) => w.includes('步数'))).toBe(true)
  })

  it('cfg > 15 返回警告', () => {
    const warns = validateKSamplerConfig({ steps: 20, cfg: 16 })
    expect(warns.some((w) => w.includes('CFG'))).toBe(true)
  })

  it('合理参数无警告', () => {
    const warns = validateKSamplerConfig({ steps: 20, cfg: 7 })
    expect(warns).toHaveLength(0)
  })
})
