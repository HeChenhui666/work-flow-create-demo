import { useCallback, useRef } from 'react'
import type { ReactFlowInstance } from '@xyflow/react'
import { FlowCanvas } from './components/FlowCanvas'
import { NodePalette } from './components/NodePalette'
import { BookmarkPanel } from './components/BookmarkPanel'
import { PropertyInspector } from './components/PropertyInspector'
import { ExecutionLog } from './components/ExecutionLog'
import { useJsonIO } from './hooks/useJsonIO'
import { useMockExecution } from './hooks/useMockExecution'
import { useViewportStore } from './stores/viewportStore'
import { useWorkflowStore } from './stores/workflowStore'
import { useExecutionStore } from './stores/executionStore'

export default function App() {
  const { exportJson, importJson, fileInputRef, handleFileChange } = useJsonIO()
  const { runExecution } = useMockExecution()
  const { addBookmark } = useViewportStore()
  const { validationErrors, nodes, edges } = useWorkflowStore()
  const isRunning = useExecutionStore((s) => s.isRunning)

  const handleRun = useCallback(() => {
    if (!isRunning) runExecution(nodes, edges)
  }, [isRunning, runExecution, nodes, edges])

  const handleStop = useCallback(() => {
    useExecutionStore.getState().reset()
  }, [])

  // 保存 ReactFlow instance 引用
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null)

  const handleInstanceReady = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance
  }, [])

  const handleAddBookmark = useCallback(() => {
    const instance = reactFlowInstanceRef.current
    if (!instance) return

    const viewport = instance.getViewport()
    addBookmark('新书签', viewport.x, viewport.y, viewport.zoom)
  }, [addBookmark])

  const handleJumpToBookmark = useCallback(
    (bookmark: { x: number; y: number; zoom: number }) => {
      const instance = reactFlowInstanceRef.current
      if (!instance) return

      instance.setViewport(
        { x: bookmark.x, y: bookmark.y, zoom: bookmark.zoom },
        { duration: 300 },
      )
    },
    [],
  )

  return (
    <div className="flex h-screen w-screen flex-col font-sans">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <h1 className="text-sm font-bold text-gray-900">FlowCanvas - AI 生图工作流编辑器</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={importJson}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            导入 JSON
          </button>
          <button
            onClick={exportJson}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            导出 JSON
          </button>
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? '⏳ 运行中...' : '▶ 运行'}
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ■ 停止
          </button>
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <button
            onClick={handleAddBookmark}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            📌 添加书签
          </button>
        </div>
      </header>

      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2">
          <p className="text-xs font-medium text-red-700">
            ⚠️ {validationErrors.length} 个验证错误:
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-red-600">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧面板 - NodePalette */}
        <aside className="w-60 border-r border-gray-200 bg-gray-50">
          <NodePalette />
        </aside>

        {/* 核心画布 */}
        <main className="flex-1 bg-gray-100">
          <FlowCanvas onInstanceReady={handleInstanceReady} />
        </main>

        {/* 右侧面板 - 属性检查器 + 书签 */}
        <aside className="flex w-72 flex-col border-l border-gray-200 bg-gray-50">
          <div className="flex-1 overflow-hidden">
            <PropertyInspector />
          </div>
          <BookmarkPanel onJumpTo={handleJumpToBookmark} />
        </aside>
      </div>

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 执行日志面板 */}
      <ExecutionLog />
    </div>
  )
}
