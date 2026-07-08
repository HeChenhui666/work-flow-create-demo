import { useState, useMemo } from 'react'
import { useDnD } from '../hooks/useDnD'
import { nodeRegistry, type RegistryNodeDef } from '../schemas/nodeRegistry'
import { NODE_DEFINITIONS, NODE_TYPES } from '../schemas/nodeDefinitions'

const CATEGORY_LABELS: Record<string, string> = {
  model: '📦 模型加载',
  encode: '📝 编码',
  sampler: '🎲 采样',
  decode: '🖼️ 解码',
  tool: '🔧 工具',
  general: '📌 通用',
}

function getFallbackDefs(): RegistryNodeDef[] {
  const categoryMap: Record<string, string> = {
    LoadCheckpoint: 'model',
    CLIPEncode: 'encode',
    KSampler: 'sampler',
    VAEDecode: 'decode',
    EmptyLatent: 'tool',
  }
  return NODE_TYPES.map((type) => {
    const def = NODE_DEFINITIONS[type]
    return {
      type,
      label: def.label ?? type,
      color: def.color,
      category: categoryMap[type] ?? 'general',
      inputs: def.inputs,
      outputs: def.outputs,
      defaultConfig: def.defaultConfig,
      tags: [],
    }
  })
}

export function NodePalette() {
  const { onDragStart } = useDnD()
  const [search, setSearch] = useState('')

  const allDefs = useMemo(() => {
    const registered = Object.values(nodeRegistry.getAll())
    return registered.length > 0 ? registered : getFallbackDefs()
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return query
      ? allDefs.filter(
          (def) =>
            def.label.toLowerCase().includes(query) || def.type.toLowerCase().includes(query),
        )
      : allDefs
  }, [allDefs, search])

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const def of filtered) {
      if (!map[def.category]) map[def.category] = []
      map[def.category].push(def)
    }
    return map
  }, [filtered])

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">节点面板</h2>
        <p className="text-xs text-gray-400 mb-2">拖拽节点到画布</p>
        <input
          type="text"
          placeholder="搜索节点..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(grouped).map(([category, defs]) => (
          <div key={category}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            {defs.map((def) => (
              <div
                key={def.type}
                data-testid={`palette-node-${def.type}`}
                draggable
                onDragStart={onDragStart(def.type)}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab hover:bg-gray-50 active:cursor-grabbing transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: def.color }}
                />
                <span className="text-xs text-gray-700 truncate">{def.label}</span>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">未找到节点</p>
        )}
      </div>
    </aside>
  )
}
