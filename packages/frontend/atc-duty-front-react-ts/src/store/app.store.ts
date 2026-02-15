// stores/app.store.ts
import { create } from 'zustand'
import { Pages, type PageKey } from '../app/router/routes'
import type {  PositionModel as Position } from '@/util/models/generated/models.ts'
import { positionService } from '@/service/position.service'

function setUrl(page: PageKey) {
  const url = new URL(window.location.href)
  url.searchParams.set('page', page)
  window.history.pushState({}, '', url)
}




interface AppState {
  page: PageKey
  setPage: (page: PageKey) => void
  isLeftBarOpen: boolean
  toggleLeftBar: () => void

  positions: Position[]
  positionsLoading: boolean
  fetchPositions: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  page: Pages.DASHBOARD,
  setPage: (page) => {
    set({ page });
    setUrl(page)
  },

  isLeftBarOpen: true,
  toggleLeftBar: () => set((state) => ({
    isLeftBarOpen: !state.isLeftBarOpen
  })),


  positions: [],
  positionsLoading: false,
  async fetchPositions() {
    set({ positionsLoading: true })
    try {
      const data = await positionService.list()
      set({ positions: data, positionsLoading: false })
    } catch {
      set({ positionsLoading: false })
    }
  },

}))
