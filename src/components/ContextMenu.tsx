import { useEffect, useRef } from 'react'

export interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  onClose: () => void
  items: ContextMenuItem[]
}

export interface ContextMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}

/**
 * ContextMenu - 右键上下文菜单
 *
 * 支持空白处和节点上的不同菜单项。
 * 点击外部或按 Escape 关闭。
 */
export function ContextMenu({ x, y, visible, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible, onClose])

  if (!visible) return null

  // 确保菜单不超出视口
  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16)

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={{ left: adjustedX, top: adjustedY }}
      data-testid="context-menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled) {
              item.onClick()
              onClose()
            }
          }}
          disabled={item.disabled}
          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
            item.disabled
              ? 'cursor-not-allowed text-gray-300'
              : item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
