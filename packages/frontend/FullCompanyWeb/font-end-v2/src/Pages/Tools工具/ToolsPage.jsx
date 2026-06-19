import React from 'react'
import { Outlet, Link } from "react-router-dom";


function ToolsPage() {
  return (
       <div className="flex flex-row flex-1 gap-3">
            <div className="bg-stone-50 w-64 px-4 flex flex-col gap-3 rounded-lg shadow-md">
                <ul className="flex flex-col">
                    <Link className="hover:underline text-lg font-semibold text-blue-700" to="名片">名片</Link>
                </ul>
            </div>
            <Outlet />
        </div>
  )
}

export default ToolsPage