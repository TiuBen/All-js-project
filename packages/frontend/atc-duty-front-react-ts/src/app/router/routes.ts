export const Pages = {
    DASHBOARD: 'dashboard',
  } as const
  
  export type PageKey = typeof Pages[keyof typeof Pages]

