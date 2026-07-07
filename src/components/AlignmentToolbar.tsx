import type { Node } from '@xyflow/react'

interface Props {
  selectedNodes: Node[]
  onAlign: (updatedNodes: Node[]) => void
}

type AlignFn = (nodes: Node[]) => Node[]

const alignLeft: AlignFn = (nodes) => {
  const minX = Math.min(...nodes.map((n) => n.position.x))
  return nodes.map((n) => ({ ...n, position: { ...n.position, x: minX } }))
}

const alignRight: AlignFn = (nodes) => {
  const maxX = Math.max(...nodes.map((n) => n.position.x))
  return nodes.map((n) => ({ ...n, position: { ...n.position, x: maxX } }))
}

const alignTop: AlignFn = (nodes) => {
  const minY = Math.min(...nodes.map((n) => n.position.y))
  return nodes.map((n) => ({ ...n, position: { ...n.position, y: minY } }))
}

const alignBottom: AlignFn = (nodes) => {
  const maxY = Math.max(...nodes.map((n) => n.position.y))
  return nodes.map((n) => ({ ...n, position: { ...n.position, y: maxY } }))
}

const alignHCenter: AlignFn = (nodes) => {
  const midX = (Math.min(...nodes.map((n) => n.position.x)) + Math.max(...nodes.map((n) => n.position.x))) / 2
  return nodes.map((n) => ({ ...n, position: { ...n.position, x: midX } }))
}

const alignVCenter: AlignFn = (nodes) => {
  const midY = (Math.min(...nodes.map((n) => n.position.y)) + Math.max(...nodes.map((n) => n.position.y))) / 2
  return nodes.map((n) => ({ ...n, position: { ...n.position, y: midY } }))
}

export function AlignmentToolbar({ selectedNodes, onAlign }: Props) {
  if (selectedNodes.length < 2) return null

  const actions = [
    { title: '左对齐', icon: '⇤', fn: alignLeft },
    { title: '右对齐', icon: '⇥', fn: alignRight },
    { title: '水平居中', icon: '↔', fn: alignHCenter },
    { title: '顶部对齐', icon: '⇡', fn: alignTop },
    { title: '底部对齐', icon: '⇣', fn: alignBottom },
    { title: '垂直居中', icon: '↕', fn: alignVCenter },
  ]

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-md px-2 py-1">
      {actions.map(({ title, icon, fn }) => (
        <button
          key={title}
          title={title}
          onClick={() => onAlign(fn(selectedNodes))}
          className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
