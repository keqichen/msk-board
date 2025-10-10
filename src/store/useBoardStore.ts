import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  SuggestionStatus, 
  SuggestionsQueryVariables 
} from '../gql/generated'

type BoardState = {
  filters: SuggestionsQueryVariables
  selection: string[] 
  targetStatus: SuggestionStatus
  undoBatch: { 
    items: { 
      id: string
      prev: SuggestionStatus
      next: SuggestionStatus 
    }[] 
  } | null
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void
  setSelection: (ids: string[]) => void  // ← Changed back to string[]
  setTargetStatus: (status: SuggestionStatus) => void
  setUndoBatch: (undo: BoardState['undoBatch']) => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      filters: { q: '' },
      selection: [],
      targetStatus: 'IN_PROGRESS',
      undoBatch: null,
      setFilters: (partial) => set((state) => ({ 
        filters: { ...state.filters, ...partial } 
      })),
      setSelection: (ids) => set({ selection: ids }),
      setTargetStatus: (status) => set({ targetStatus: status }),
      setUndoBatch: (undo) => set({ undoBatch: undo }),
    }),
    { name: 'vida-board-ui' }
  )
)