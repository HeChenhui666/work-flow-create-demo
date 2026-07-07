import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlignmentToolbar } from '../AlignmentToolbar'
import type { Node } from '@xyflow/react'

const nodes: Node[] = [
  { id: 'a', position: { x: 0, y: 100 }, data: {}, type: 'default' },
  { id: 'b', position: { x: 200, y: 300 }, data: {}, type: 'default' },
]

describe('AlignmentToolbar', () => {
  it('有 2+ 节点时显示工具栏', () => {
    render(<AlignmentToolbar selectedNodes={nodes} onAlign={vi.fn()} />)
    expect(screen.getByTitle('左对齐')).toBeInTheDocument()
  })

  it('少于 2 个节点时不显示', () => {
    render(<AlignmentToolbar selectedNodes={[nodes[0]]} onAlign={vi.fn()} />)
    expect(screen.queryByTitle('左对齐')).not.toBeInTheDocument()
  })

  it('点击左对齐调用 onAlign 并传入更新后的节点', () => {
    const onAlign = vi.fn()
    render(<AlignmentToolbar selectedNodes={nodes} onAlign={onAlign} />)
    fireEvent.click(screen.getByTitle('左对齐'))
    expect(onAlign).toHaveBeenCalledTimes(1)
    const result = onAlign.mock.calls[0][0] as Node[]
    expect(result.every((n) => n.position.x === 0)).toBe(true)
  })
})
