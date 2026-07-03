import { z } from 'zod'
import type { NodeType } from './nodeDefinitions'

export type { NodeType }

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  config: Record<string, unknown>
}

export interface WorkflowEdge {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata: { version: number; updatedAt: string }
}

const nodeTypeSchema = z.enum([
  'LoadCheckpoint', 'CLIPEncode', 'EmptyLatent', 'KSampler', 'VAEDecode',
])

const workflowNodeSchema = z.object({
  id:       z.string(),
  type:     nodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  config:   z.record(z.unknown()),
})

const workflowEdgeSchema = z.object({
  id:           z.string(),
  source:       z.string(),
  sourceHandle: z.string(),
  target:       z.string(),
  targetHandle: z.string(),
})

export const workflowDefinitionSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  nodes:    z.array(workflowNodeSchema),
  edges:    z.array(workflowEdgeSchema),
  metadata: z.object({ version: z.number(), updatedAt: z.string() }),
})
