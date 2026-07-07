import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContextMenu } from '../ContextMenu'

describe('ContextMenu', () => {
  it('visible=false 时不应渲染', () => {
    const { container } = render(
      <ContextMenu x={100} y={100} visible={false} onClose={() => {}} items={[]} />,
    )
    expect(container.querySelector('[data-testid="context-menu"]')).not.toBeInTheDocument()
  })

  it('visible=true 时应渲染菜单', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={() => {}}
        items={[{ label: '测试项', onClick: () => {} }]}
      />,
    )
    expect(screen.getByTestId('context-menu')).toBeInTheDocument()
    expect(screen.getByText('测试项')).toBeInTheDocument()
  })

  it('应渲染多个菜单项', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={() => {}}
        items={[
          { label: '第一项', onClick: () => {} },
          { label: '第二项', onClick: () => {} },
          { label: '危险操作', onClick: () => {}, danger: true },
        ]}
      />,
    )
    expect(screen.getByText('第一项')).toBeInTheDocument()
    expect(screen.getByText('第二项')).toBeInTheDocument()
    expect(screen.getByText('危险操作')).toBeInTheDocument()
  })

  it('disabled 项应被禁用', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={() => {}}
        items={[{ label: '禁用项', onClick: () => {}, disabled: true }]}
      />,
    )
    const button = screen.getByText('禁用项')
    expect(button).toBeDisabled()
  })

  it('组件应被正确导出', () => {
    expect(ContextMenu).toBeDefined()
    expect(typeof ContextMenu).toBe('function')
  })
})
