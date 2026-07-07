import { useState } from 'react'
import { useExecutionStore } from '../stores/executionStore'

export function ExecutionLog() {
  const [open, setOpen] = useState(false)
  const logs = useExecutionStore((s) => s.logs)
  const isRunning = useExecutionStore((s) => s.isRunning)

  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000)
    const frac = String(ms % 1000).padStart(3, '0').slice(0, 2)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${frac}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 text-gray-100 font-mono text-xs select-none">
      <button
        className="flex w-full items-center gap-2 px-4 py-1.5 hover:bg-gray-800 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`} />
        <span>执行日志</span>
        {logs.length > 0 && (
          <span className="text-gray-500 text-[10px]">({logs.length} 条)</span>
        )}
        <span className="ml-auto text-gray-500">{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="max-h-48 overflow-y-auto border-t border-gray-700 px-4 py-2 space-y-0.5">
          {logs.length === 0 ? (
            <span className="text-gray-500">暂无日志，点击"运行"开始执行</span>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-gray-500 shrink-0">[{formatTime(log.timestamp)}]</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
