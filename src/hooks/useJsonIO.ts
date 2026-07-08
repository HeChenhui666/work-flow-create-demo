import { useCallback, useRef } from 'react'
import { useWorkflowStore } from '../stores/workflowStore'
import { rfToDefinition, definitionToRF } from '../schemas/converters'
import { workflowDefinitionSchema } from '../schemas/workflow'

/**
 * useJsonIO - JSON 导入/导出 hook
 *
 * 导出：将当前画布状态序列化为 WorkflowDefinition JSON 并下载
 * 导入：读取 JSON 文件，校验后加载到画布
 */
export function useJsonIO() {
  const { nodes, edges, meta, setNodes, setEdges, setName, setValidationErrors } =
    useWorkflowStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportJson = useCallback(() => {
    const definition = rfToDefinition(nodes, edges, {
      id: meta.id,
      name: meta.name,
    })

    const jsonString = JSON.stringify(definition, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${meta.name || 'workflow'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [nodes, edges, meta])

  const importJson = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          const result = workflowDefinitionSchema.safeParse(json)

          if (!result.success) {
            setValidationErrors([`JSON 格式错误: ${result.error.message}`])
            return
          }

          const definition = result.data
          const { nodes: newNodes, edges: newEdges } = definitionToRF(definition)

          setNodes(newNodes)
          setEdges(newEdges)
          setName(definition.name)
          setValidationErrors([])
        } catch (error) {
          setValidationErrors([`导入失败: ${error instanceof Error ? error.message : '未知错误'}`])
        }
      }
      reader.readAsText(file)

      // 重置 input 以允许重复选择同一文件
      event.target.value = ''
    },
    [setNodes, setEdges, setName, setValidationErrors],
  )

  return {
    exportJson,
    importJson,
    fileInputRef,
    handleFileChange,
  }
}
