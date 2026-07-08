import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from '../data/workflowTemplates'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (template: WorkflowTemplate) => void
}

export function TemplateModal({ open, onClose, onSelect }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[600px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">工作流模板</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          {WORKFLOW_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template)
                onClose()
              }}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-sm text-gray-800">{template.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {template.nodes.length} 个节点 · {template.edges.length} 条连线
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
