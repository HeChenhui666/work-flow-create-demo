import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { type NodeProps, useViewport } from '@xyflow/react'
import { useWorkflowStore } from '../../stores/workflowStore'

export interface NoteNodeData {
  text: string
  backgroundColor: string
  [key: string]: unknown
}

interface NoteNodeProps extends NodeProps {
  data: NoteNodeData
}

const ZOOM_FAR = 0.4

/** 阻止所有指针事件冒泡到 ReactFlow 画布，确保表单可交互 */
const stopAllPointerEvents = (event: React.SyntheticEvent) => {
  event.stopPropagation()
  event.nativeEvent.stopImmediatePropagation()
}

/**
 * useIMEAwareInput - 支持中文输入法（IME）的受控输入 Hook
 */
function useIMEAwareInput(
  externalValue: string,
  onExternalChange: (value: string) => void,
) {
  const [localValue, setLocalValue] = useState(externalValue)
  const isComposingRef = useRef(false)

  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value
      setLocalValue(newValue)
      if (!isComposingRef.current) {
        onExternalChange(newValue)
      }
    },
    [onExternalChange],
  )

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(
    (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = false
      const finalValue = event.currentTarget.value
      setLocalValue(finalValue)
      onExternalChange(finalValue)
    },
    [onExternalChange],
  )

  return {
    value: localValue,
    onChange: handleChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }
}

/**
 * NoteNode - 区域注释节点
 */
export const NoteNode = memo(function NoteNode({ data, id }: NoteNodeProps) {
  const { zoom } = useViewport()
  const { updateNodeData, removeNode, setSelectedNodeId } = useWorkflowStore()

  const handleTextChange = useCallback(
    (value: string) => {
      updateNodeData(id, { text: value })
    },
    [id, updateNodeData],
  )

  const textInput = useIMEAwareInput(data.text || '', handleTextChange)

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      removeNode(id)
      setSelectedNodeId(null)
    },
    [id, removeNode, setSelectedNodeId],
  )

  if (zoom < ZOOM_FAR) return null

  return (
    <div
      className="nowheel nodrag group relative min-h-[80px] min-w-[200px] rounded p-3 transition-opacity duration-100"
      style={{
        backgroundColor: data.backgroundColor || 'rgba(255, 255, 200, 0.6)',
        opacity: zoom < 0.7 ? 0.7 : 1,
      }}
      data-testid="note-node"
    >
      <button
        onClick={handleDelete}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm hover:bg-red-600 group-hover:flex"
        title="删除注释"
      >
        ×
      </button>
      <div
        className="react-flow__node-input"
        onMouseDown={stopAllPointerEvents}
        onClick={stopAllPointerEvents}
        onPointerDown={stopAllPointerEvents}
        onTouchStart={stopAllPointerEvents}
        style={{ pointerEvents: 'auto', width: 'max-content' }}
      >
        <textarea
          className="h-full w-full resize-none border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          value={textInput.value}
          onChange={textInput.onChange}
          onCompositionStart={textInput.onCompositionStart}
          onCompositionEnd={textInput.onCompositionEnd}
          placeholder="输入注释..."
          rows={3}
        />
      </div>
    </div>
  )
})
