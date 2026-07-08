import type { PortDef } from './nodeDefinitions'
import type { NodeEventType, NodeEventHandler } from '../stores/nodeEventBus'

export interface RegistryNodeDef {
  type: string
  label: string
  color: string
  category: string
  inputs: PortDef[]
  outputs: PortDef[]
  defaultConfig: Record<string, unknown>
  tags?: string[]
  hooks?: Partial<Record<NodeEventType, NodeEventHandler<any>>>
  validate?: (config: Record<string, unknown>) => string[]
  version?: string
  deprecated?: boolean
}

export class NodeRegistry {
  private _defs: Record<string, RegistryNodeDef> = {}

  register(def: RegistryNodeDef) {
    this._defs[def.type] = def
  }

  get(type: string): RegistryNodeDef | undefined {
    return this._defs[type]
  }

  getAll(): Record<string, RegistryNodeDef> {
    return { ...this._defs }
  }

  getByCategory(category: string): RegistryNodeDef[] {
    return Object.values(this._defs).filter((d) => d.category === category)
  }

  getTypes(): string[] {
    return Object.keys(this._defs)
  }
}

export const nodeRegistry = new NodeRegistry()
