import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactFlowInstance } from '@xyflow/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { FlowCanvas } from './components/FlowCanvas'
import { NodePalette } from './components/NodePalette'
import { BookmarkPanel } from './components/BookmarkPanel'
import { PropertyInspector } from './components/PropertyInspector'
import { ExecutionLog } from './components/ExecutionLog'
import { TemplateModal } from './components/TemplateModal'
import { Toaster } from './components/ui/sonner'
import { useJsonIO } from './hooks/useJsonIO'
import { useMockExecution } from './hooks/useMockExecution'
import { useAutoSave } from './hooks/useAutoSave'
import { useViewportStore } from './stores/viewportStore'
import { useWorkflowStore } from './stores/workflowStore'
import { useExecutionStore } from './stores/executionStore'
import { autoLayout } from './utils/autoLayout'
import { exportCanvasToPng } from './utils/pngExport'
import { validateWorkflow } from './utils/workflowValidation'
import type { WorkflowTemplate } from './data/workflowTemplates'

/** 工作流 JSON 导入的 Schema 验证 */
const workflowImportSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    type: z.string().optional(),
    data: z.record(z.unknown()).optional(),
  }).passthrough()),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  }).passthrough()),
})

export default function App() {
  const { exportJson, importJson, fileInputRef, handleFileChange } = useJsonIO()
  const { runExecution, stopExecution } = useMockExecution()
  const { addBookmark } = useViewportStore()
  const { validationErrors, nodes, edges, isDirty } = useWorkflowStore()
  const isRunning = useExecutionStore((s) => s.isRunning)
  const [templateOpen, setTemplateOpen] = useState(false)
  const hasShownRestoreToast = useRef(false)

  useAutoSave({ nodes, edges, isDirty })

  useEffect(() => {
    if (hasShownRestoreToast.current) return
    const saved = localStorage.getItem('workflow-autosave')
    if (!saved) return
    try {
      const { nodes: savedNodes, edges: savedEdges, savedAt } = JSON.parse(saved)
      if (savedNodes?.length > 0) {
        hasShownRestoreToast.current = true
        const date = new Date(savedAt).toLocaleString()
        toast(
          <div className="flex flex-col gap-2">
            <p className="text-sm">发现上次自动保存的工作流（{date}）</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  useWorkflowStore.getState().setNodes(savedNodes)
                  useWorkflowStore.getState().setEdges(savedEdges)
                  toast.dismiss()
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                恢复
              </button>
              <button
                onClick={() => toast.dismiss()}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
              >
                忽略
              </button>
            </div>
          </div>,
          { duration: Infinity }
        )
      }
    } catch (_) {}
  }, [])

  const handleRun = useCallback(() => {
    if (isRunning) return
    const issues = validateWorkflow(nodes, edges)
    const errors = issues.filter((i) => i.type === 'cycle')
    if (errors.length > 0) {
      alert(errors.map((e) => e.message).join('\n'))
      return
    }
    runExecution(nodes, edges)
  }, [isRunning, runExecution, nodes, edges])

  const handleStop = useCallback(() => {
    stopExecution()
  }, [stopExecution])

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

  const handleAutoLayout = useCallback(() => {
    useWorkflowStore.getState().commit()
    const layoutedNodes = autoLayout(nodes, edges)
    useWorkflowStore.getState().setNodes(layoutedNodes)
  }, [nodes, edges])

  const handleExportPng = useCallback(async () => {
    const canvasElement = document.querySelector('[data-testid="flow-canvas"]') as HTMLElement
    if (!canvasElement) {
      toast.error('找不到画布元素，无法导出 PNG')
      return
    }
    const success = await exportCanvasToPng(canvasElement)
    if (success) {
      toast.success('PNG 导出成功')
    }
  }, [])

  const handleLoadTemplate = useCallback((template: WorkflowTemplate) => {
    useWorkflowStore.getState().commit()
    useWorkflowStore.getState().setNodes(template.nodes)
    useWorkflowStore.getState().setEdges(template.edges)
  }, [])

  // JSON 拖放导入 - 仅在检测到文件时阻止默认行为
  const handleJsonDragOver = useCallback((event: React.DragEvent) => {
    // 只有当拖拽的是文件时才处理，否则让事件继续传播到画布
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleJsonDrop = useCallback((event: React.DragEvent) => {
    const file = event.dataTransfer.files[0]
    // 只有当有文件且是 JSON 时才处理
    if (!file || !file.name.endsWith('.json')) return

    event.preventDefault()
    event.stopPropagation()

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const result = workflowImportSchema.safeParse(data)
        if (!result.success) {
          toast.error(`JSON 格式错误: ${result.error.issues[0]?.message ?? '未知错误'}`)
          return
        }
        useWorkflowStore.getState().commit()
        useWorkflowStore.getState().setNodes(result.data.nodes)
        useWorkflowStore.getState().setEdges(result.data.edges)
        toast.success('工作流导入成功')
      } catch {
        toast.error('JSON 文件解析失败')
      }
    }
    reader.readAsText(file)
  }, [])

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
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <button
            onClick={handleAutoLayout}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            🔄 自动布局
          </button>
          <button
            onClick={handleExportPng}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            📷 导出 PNG
          </button>
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <button
            onClick={() => setTemplateOpen(true)}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            📋 模板
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
        <main
          className="flex-1 bg-gray-100"
          onDragOver={handleJsonDragOver}
          onDrop={handleJsonDrop}
        >
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

      {/* 模板选择弹窗 */}
      <TemplateModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={handleLoadTemplate}
      />

      {/* Toast 通知容器 */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
