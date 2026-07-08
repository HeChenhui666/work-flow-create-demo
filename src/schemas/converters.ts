import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { WorkflowDefinition } from './workflow'
import { NODE_DEFINITIONS, type NodeType } from './nodeDefinitions'

export function definitionToRF(def: WorkflowDefinition): { nodes: RFNode[]; edges: RFEdge[] } {
  const nodes: RFNode[] = def.nodes.map((n) => {
    const nodeDef = NODE_DEFINITIONS[n.type]
    return {
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: n.type,
        config: n.config,
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
        color: nodeDef.color,
      },
    }
  })

  const edges: RFEdge[] = def.edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle,
    target: e.target,
    targetHandle: e.targetHandle,
    type: 'typed',
    data: {
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    },
  }))

  return { nodes, edges }
}

export function rfToDefinition(
  nodes: RFNode[],
  edges: RFEdge[],
  meta: { id: string; name: string; version?: number },
): WorkflowDefinition {
  return {
    id: meta.id,
    name: meta.name,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as NodeType,
      position: n.position,
      config: (n.data?.config as Record<string, unknown>) ?? {},
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle ?? '',
      target: e.target,
      targetHandle: e.targetHandle ?? '',
    })),
    metadata: {
      version: meta.version ?? 1,
      updatedAt: new Date().toISOString(),
    },
  }
}
