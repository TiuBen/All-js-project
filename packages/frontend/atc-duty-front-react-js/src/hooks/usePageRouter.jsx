// app/router/usePageRouter.ts
import React from 'react'
import { useAppStore } from '@/store/app.store'
import { Pages, PageKey } from './routes'

import Dashboard from '@/pages/dashboard/dashboard'

const pageMap: Record<PageKey, React.ComponentType> = {
  [Pages.DASHBOARD]: Dashboard,

}

export function PageRouter() {
  const page = useAppStore((s) => s.page)
  const PageComponent = pageMap[page];

  // Fallback to a default component if PageComponent is undefined
  if (!PageComponent) {
    return <div>Page not found </div>;
  }
  return <PageComponent/>;
}
