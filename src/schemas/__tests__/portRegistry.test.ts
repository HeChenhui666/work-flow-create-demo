import { describe, it, expect } from 'vitest'
import { PORT_COLORS, PORT_TYPES } from '../portRegistry'

describe('portRegistry', () => {
  it('每个 PortType 都有对应颜色', () => {
    PORT_TYPES.forEach((type) => {
      expect(PORT_COLORS[type]).toBeDefined()
      expect(PORT_COLORS[type]).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})
