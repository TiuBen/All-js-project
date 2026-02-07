import React from 'react'
import { Outlet } from 'react-router-dom'

function Page2() {
  return (
     <div className="flex flex-row h-[calc(100vh-4.5rem)]">
        <Outlet />
    </div>
  )
}

export default Page2