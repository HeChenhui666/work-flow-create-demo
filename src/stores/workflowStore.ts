import { create } from 'zustand'
import { nanoid } from 'nanoid'

interface WorkflowMeta {
  id: string
  name: string
}

interface WorkflowState {
  meta: WorkflowMeta
  isDirty: boolean
  validationErrors: string[]
  setName: (name: string) => void
  setDirty: (dirty: boolean) => void
  setValidationErrors: (errors: string[]) => void
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  meta: { id: nanoid(), name: '未命名工作流' },
  isDirty: false,
  validationErrors: [],
  setName: (name) => set((s) => ({ meta: { ...s.meta, name }, isDirty: true })),
  setDirty: (isDirty) => set({ isDirty }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
}))
