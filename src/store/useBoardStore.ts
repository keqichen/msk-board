import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  SuggestionStatus, 
  SuggestionsQueryVariables 
} from '../gql/generated'

type BoardState = {
  filters: SuggestionsQueryVariables
  targetStatus: SuggestionStatus
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void
  setTargetStatus: (status: SuggestionStatus) => void
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
      setTargetStatus: (status) => set({ targetStatus: status }),
    }),
    { name: 'vida-board-ui' }
  )
)