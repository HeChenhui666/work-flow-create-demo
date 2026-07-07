import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type OnSelectionChangeParams,
  type OnNodesDelete,
  type OnEdgesDelete,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useWorkflowStore } from '../stores/workflowStore'
import { useConnection } from '../hooks/useConnection'
import { useDnD } from '../hooks/useDnD'
import { NODE_DEFINITIONS, type NodeType } from '../schemas/nodeDefinitions'
import { LoadCheckpointNode, CLIPEncodeNode, EmptyLatentNode, KSamplerNode, VAEDecodeNode } from './nodes/WorkflowNodes'
import { NoteNode } from './nodes/NoteNode'
import { LoRALoaderNode, ImageLoadNode, ImagePreviewNode, UpscalerNode } from './nodes/ExtendedNodes'
import { TypedEdge } from './edges/TypedEdge'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import { AlignmentToolbar } from './AlignmentToolbar'

// 节点类型注册表
const nodeTypes = {
  LoadCheckpoint: LoadCheckpointNode,
  CLIPEncode: CLIPEncodeNode,
  EmptyLatent: EmptyLatentNode,
  KSampler: KSamplerNode,
  VAEDecode: VAEDecodeNode,
  Note: NoteNode,
  LoRALoader: LoRALoaderNode,
  ImageLoad: ImageLoadNode,
  ImagePreview: ImagePreviewNode,
  Upscaler: UpscalerNode,
}

// 边类型注册表
const edgeTypes = {
  typed: TypedEdge,
}

export interface FlowCanvasHandle {
  getReactFlowInstance: () => ReactFlowInstance | null
}

/**
 * FlowCanvas - AI 生图工作流核心画布组件
 *
 * 集成：
 * - React Flow v12 渲染引擎
 * - useConnection 连线类型校验
 * - useDnD 拖拽创建节点
 * - Background 动态网格
 * - Minimap 缩略导航
 * - Controls 缩放控制
 */
export function FlowCanvas({ onInstanceReady }: { onInstanceReady?: (instance: ReactFlowInstance) => void }) {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode,
    removeNode,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addEdge: addStoreEdge,
    setSelectedNodeId,
  } = useWorkflowStore()

  // 使用 React Flow 的受控状态 hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  // 关键：当 store 中的 nodes/edges 变化时（如 updateNodeData），同步到 ReactFlow 本地状态
  // 使用 ref 避免无限循环：仅在 store 数据真正变化时同步
  const prevStoreNodesRef = useRef(storeNodes)
  const prevStoreEdgesRef = useRef(storeEdges)

  useEffect(() => {
    if (prevStoreNodesRef.current !== storeNodes) {
      prevStoreNodesRef.current = storeNodes
      setNodes(storeNodes)
    }
  }, [storeNodes, setNodes])

  useEffect(() => {
    if (prevStoreEdgesRef.current !== storeEdges) {
      prevStoreEdgesRef.current = storeEdges
      setEdges(storeEdges)
    }
  }, [storeEdges, setEdges])

  const { isValidConnection } = useConnection()
  const { setReactFlowInstance, onDragStart, onDragOver, onDrop } = useDnD()

  // 保存 ReactFlow instance 引用供外部调用
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null)

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    nodeId?: string
  }>({ visible: false, x: 0, y: 0 })

  // 多选节点状态（用于对齐工具栏）
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])

  // 连线校验回调
  const handleIsValidConnection = useCallback(
    (connection: Connection) => isValidConnection(connection, nodes),
    [isValidConnection, nodes],
  )

  // 连线创建回调
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!handleIsValidConnection(connection)) return

      const newEdge: Edge = {
        id: `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
        type: 'typed',
        data: {
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))
      addStoreEdge(newEdge)
    },
    [handleIsValidConnection, setEdges, addStoreEdge],
  )

  // 节点变化同步回 store
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      // 将位置变化同步到 store
      const positionChanges = changes.filter(
        (c) => c.type === 'position' && c.position !== undefined,
      )
      if (positionChanges.length > 0) {
        const updatedNodes = nodes.map((node) => {
          const change = positionChanges.find((c) => c.id === node.id)
          if (change && change.position) {
            return { ...node, position: change.position }
          }
          return node
        })
        setStoreNodes(updatedNodes)
      }
    },
    [onNodesChange, nodes, setStoreNodes],
  )

  // 边变化同步回 store
  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes)
      // 将边的移除同步到 store
      const removedEdgeIds = changes
        .filter((c) => c.type === 'remove')
        .map((c) => c.id)
      if (removedEdgeIds.length > 0) {
        removedEdgeIds.forEach((edgeId) => {
          useWorkflowStore.getState().removeEdge(edgeId)
        })
      }
    },
    [onEdgesChange],
  )

  // 拖拽放置处理
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      onDrop(event, (newNode) => {
        addNode(newNode as Node)
      })
    },
    [onDrop, addNode],
  )

  // 右键菜单处理
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, nodeId?: string) => {
      event.preventDefault()
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        nodeId,
      })
    },
    [],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [])

  // 构建右键菜单项
  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    if (contextMenu.nodeId) {
      // 节点上的右键菜单
      return [
        {
          label: '复制节点',
          onClick: () => {
            const node = nodes.find((n) => n.id === contextMenu.nodeId)
            if (node) {
              const newNode: Node = {
                ...node,
                id: `${node.id}-copy-${Date.now()}`,
                position: { x: node.position.x + 20, y: node.position.y + 20 },
              }
              setNodes((nds) => [...nds, newNode])
              addNode(newNode)
            }
          },
        },
        {
          label: '删除节点',
          danger: true,
          onClick: () => {
            if (contextMenu.nodeId) {
              setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId))
              removeNode(contextMenu.nodeId)
              // 如果删除的是当前选中节点，清除选中状态
              if (useWorkflowStore.getState().selectedNodeId === contextMenu.nodeId) {
                setSelectedNodeId(null)
              }
            }
          },
        },
      ]
    } else {
      // 空白处的右键菜单
      return [
        {
          label: '添加注释',
          onClick: () => {
            const instance = reactFlowInstanceRef.current
            if (instance) {
              const position = instance.screenToFlowPosition({
                x: contextMenu.x,
                y: contextMenu.y,
              })
              const noteNode: Node = {
                id: `note-${Date.now()}`,
                type: 'Note',
                position,
                data: {
                  text: '',
                  backgroundColor: 'rgba(255, 255, 200, 0.6)',
                },
              }
              setNodes((nds) => [...nds, noteNode])
              addNode(noteNode)
            }
          },
        },
        {
          label: '适应屏幕',
          onClick: () => {
            const instance = reactFlowInstanceRef.current
            if (instance) {
              instance.fitView({ padding: 0.2, duration: 300 })
            }
          },
        },
        {
          label: '重置视图',
          onClick: () => {
            const instance = reactFlowInstanceRef.current
            if (instance) {
              instance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 })
            }
          },
        },
      ]
    }
  }, [contextMenu, nodes, setNodes, addNode, removeNode])

  // 背景样式根据缩放级别动态切换
  const backgroundVariant = BackgroundVariant.Lines

  // 选中节点变化处理
  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedNode = params.nodes[0]
      setSelectedNodeId(selectedNode ? selectedNode.id : null)
      setSelectedNodes(params.nodes)
    },
    [setSelectedNodeId],
  )

  // 对齐操作回调
  const handleAlign = useCallback((alignedNodes: Node[]) => {
    setNodes((nds) => nds.map((n) => {
      const aligned = alignedNodes.find((a) => a.id === n.id)
      return aligned ? { ...n, position: aligned.position } : n
    }))
    setStoreNodes(storeNodes.map((n) => {
      const aligned = alignedNodes.find((a) => a.id === n.id)
      return aligned ? { ...n, position: aligned.position } : n
    }))
  }, [setNodes, setStoreNodes, storeNodes])

  // 节点删除回调（键盘 Delete/Backspace 或右键菜单触发）
  const handleNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => {
        removeNode(node.id)
      })
      // 清除选中状态
      if (deletedNodes.some((n) => n.id === useWorkflowStore.getState().selectedNodeId)) {
        setSelectedNodeId(null)
      }
    },
    [removeNode, setSelectedNodeId],
  )

  // 边删除回调
  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => {
        useWorkflowStore.getState().removeEdge(edge.id)
      })
    },
    [],
  )

  // 键盘快捷键：Delete/Backspace 删除选中节点
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果焦点在输入框内，不触发删除
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        const { nodes: undoneNodes, edges: undoneEdges } = useWorkflowStore.getState()
        useWorkflowStore.getState().undo()
        const { nodes: restoredNodes, edges: restoredEdges } = useWorkflowStore.getState()
        if (restoredNodes !== undoneNodes) {
          setNodes(restoredNodes)
          setEdges(restoredEdges)
        }
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault()
        const { nodes: beforeNodes, edges: beforeEdges } = useWorkflowStore.getState()
        useWorkflowStore.getState().redo()
        const { nodes: afterNodes, edges: afterEdges } = useWorkflowStore.getState()
        if (afterNodes !== beforeNodes) {
          setNodes(afterNodes)
          setEdges(afterEdges)
        }
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const { selectedNodeId } = useWorkflowStore.getState()
        if (selectedNodeId) {
          // 从 ReactFlow 本地状态中移除
          setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
          // 从 store 中移除（会自动清理关联的边）
          removeNode(selectedNodeId)
          setSelectedNodeId(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [removeNode, setSelectedNodeId, setNodes])

  // 初始化回调：保存 instance 并通知父组件
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstanceRef.current = instance
      setReactFlowInstance(instance)
      onInstanceReady?.(instance)
    },
    [setReactFlowInstance, onInstanceReady],
  )

  return (
    <div
      className="h-full w-full"
      data-testid="flow-canvas"
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        isValidConnection={handleIsValidConnection}
        onInit={handleInit}
        onContextMenu={(event) => handleContextMenu(event)}
        onNodeContextMenu={(event, node) => handleContextMenu(event, node.id)}
        onSelectionChange={handleSelectionChange}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'typed',
          animated: false,
        }}
        onlyRenderVisibleElements
        className="bg-gray-50"
      >
        <Background
          variant={backgroundVariant}
          gap={16}
          size={1}
          color="#e5e7eb"
        />
        <MiniMap
          nodeColor={(node) => {
            const nodeType = node.type as NodeType | undefined
            if (nodeType && NODE_DEFINITIONS[nodeType]) {
              return NODE_DEFINITIONS[nodeType].color
            }
            return '#94a3b8'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="rounded-lg border border-gray-200 shadow-sm"
        />
        <Controls
          showInteractive={false}
          className="rounded-lg border border-gray-200 shadow-sm"
        />
      </ReactFlow>

      <AlignmentToolbar selectedNodes={selectedNodes} onAlign={handleAlign} />

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={closeContextMenu}
        items={contextMenuItems}
      />
    </div>
  )
}
