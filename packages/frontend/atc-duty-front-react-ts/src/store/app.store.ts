// stores/app.store.ts
import { create } from 'zustand'
import { Pages, type PageKey } from '../app/router/routes'
import { type Position } from '@/util/models/generated/browser'


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

}))
