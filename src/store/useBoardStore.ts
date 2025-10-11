// store/useBoardStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  SuggestionsQueryVariables 
} from '../gql/generated'
import {
  type ColumnVisibility,
  DEFAULT_COLUMN_VISIBILITY,
} from "../constants/suggestionsColumns"

type BoardState = {
  // Filters state
  filters: SuggestionsQueryVariables
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void
  
  // Column visibility state
  columnVisibility: ColumnVisibility
  setColumnVisibility: (visibility: ColumnVisibility) => void
  toggleColumn: (field: keyof ColumnVisibility) => void
  resetColumnVisibility: () => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      // Filters state
      filters: { q: '' },
      setFilters: (partial) => set((state) => ({ 
        filters: { ...state.filters, ...partial } 
      })),

      // Column visibility state
      columnVisibility: DEFAULT_COLUMN_VISIBILITY,
      setColumnVisibility: (visibility) => set({ columnVisibility: visibility }),
      toggleColumn: (field) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [field]: !state.columnVisibility[field],
          },
        })),
      resetColumnVisibility: () =>
        set({ columnVisibility: DEFAULT_COLUMN_VISIBILITY }),
    }),
    { name: 'vida-board-ui' }
  )
)