import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  SuggestionsQueryVariables 
} from '../gql/generated'

type BoardState = {
  filters: SuggestionsQueryVariables
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      filters: { q: '' },
      setFilters: (partial) => set((state) => ({ 
        filters: { ...state.filters, ...partial } 
      })),
    }),
    { name: 'vida-board-ui' }
  )
)