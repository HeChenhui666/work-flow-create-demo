import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ShortcutItem {
  keys: string[]
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['?', 'Shift + /'], description: '打开/关闭快捷键面板' },
  { keys: ['⌘', 'Z'], description: '撤销' },
  { keys: ['⌘', 'Shift', 'Z'], description: '重做' },
  { keys: ['Delete'], description: '删除选中节点' },
  { keys: ['Backspace'], description: '删除选中节点' },
  { keys: ['Esc'], description: '取消选择 / 关闭弹窗' },
]

export function KeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl dark:bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">键盘快捷键</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {SHORTCUTS.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="min-w-[24px] rounded border border-border bg-muted px-2 py-1 text-center text-xs font-medium text-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            💡 提示：按{' '}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
              ?
            </kbd>{' '}
            可随时打开此面板
          </p>
        </div>
      </div>
    </div>
  )
}
