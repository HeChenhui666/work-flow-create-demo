import { useCallback, useEffect } from 'react'
import { useViewportStore, type Bookmark } from '../stores/viewportStore'

interface BookmarkPanelProps {
  onJumpTo: (bookmark: Bookmark) => void
}

/**
 * BookmarkPanel - 视口书签面板
 *
 * 显示所有保存的书签，支持点击跳转和删除。
 * 快捷键：Ctrl/Cmd + 数字键跳转到对应书签。
 */
export function BookmarkPanel({ onJumpTo }: BookmarkPanelProps) {
  const { bookmarks, removeBookmark } = useViewportStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key)) {
        event.preventDefault()
        const index = parseInt(event.key, 10) - 1
        if (index < bookmarks.length) {
          onJumpTo(bookmarks[index])
        }
      }
    },
    [bookmarks, onJumpTo],
  )

  // 注册全局快捷键监听（使用 useEffect 确保正确清理）
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">视口书签</h3>
        <span className="text-[10px] text-gray-400">Ctrl+数字跳转</span>
      </div>

      {bookmarks.length === 0 ? (
        <p className="text-xs text-gray-400">暂无书签</p>
      ) : (
        <div className="space-y-1">
          {bookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="group flex items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
            >
              <button
                onClick={() => onJumpTo(bookmark)}
                className="flex-1 truncate text-left text-xs text-gray-700"
                title={`${bookmark.label} (${Math.round(bookmark.x)}, ${Math.round(bookmark.y)}) @ ${Math.round(bookmark.zoom * 100)}%`}
              >
                <span className="mr-1 inline-block w-4 text-center text-[10px] text-gray-400">
                  {index + 1}
                </span>
                {bookmark.label}
              </button>
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="ml-1 hidden text-gray-400 hover:text-red-500 group-hover:block"
                title="删除书签"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
