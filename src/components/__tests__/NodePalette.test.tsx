import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NodePalette } from '../NodePalette'

describe('NodePalette', () => {
  it('应渲染面板标题', () => {
    render(<NodePalette />)
    expect(screen.getByText('节点面板')).toBeInTheDocument()
  })

  it('应渲染搜索输入框', () => {
    render(<NodePalette />)
    expect(screen.getByPlaceholderText('搜索节点...')).toBeInTheDocument()
  })

  it('搜索过滤应只显示匹配节点', () => {
    render(<NodePalette />)
    const input = screen.getByPlaceholderText('搜索节点...')
    fireEvent.change(input, { target: { value: 'KSampler' } })
    expect(screen.getByTestId('palette-node-KSampler')).toBeInTheDocument()
    expect(screen.queryByTestId('palette-node-LoadCheckpoint')).not.toBeInTheDocument()
  })

  it('节点卡片应可拖拽', () => {
    render(<NodePalette />)
    const card = screen.getByTestId('palette-node-KSampler')
    expect(card).toHaveAttribute('draggable', 'true')
  })
})
