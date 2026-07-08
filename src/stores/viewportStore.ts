import { create } from 'zustand'

export interface Bookmark {
  id: string
  label: string
  x: number
  y: number
  zoom: number
}

interface ViewportState {
  bookmarks: Bookmark[]
  addBookmark: (label: string, x: number, y: number, zoom: number) => void
  removeBookmark: (id: string) => void
}

export const useViewportStore = create<ViewportState>((set) => ({
  bookmarks: [],
  addBookmark: (label, x, y, zoom) =>
    set((s) => ({
      bookmarks: [...s.bookmarks, { id: crypto.randomUUID(), label, x, y, zoom }],
    })),
  removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
}))
