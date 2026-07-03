import { z } from 'zod'
import { NODE_TYPES } from './nodeDefinitions'

export type { NodeType } from './nodeDefinitions'

const nodeTypeSchema = z.enum(NODE_TYPES)

const workflowNodeSchema = z.object({
  id:       z.string(),
  type:     nodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  config:   z.record(z.string(), z.unknown()),
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

export type WorkflowNode       = z.infer<typeof workflowNodeSchema>
export type WorkflowEdge       = z.infer<typeof workflowEdgeSchema>
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>
