import { Outlet } from 'react-router-dom'
import {HorizontalNav} from './Components/HorizontalNav'
import {VerticalNav} from './Components/VerticalNav'

function Main() {
  return (
    <div className='main w-full h-full relative flex flex-col overflow-hidden'>
      <HorizontalNav/>
      <div className='flex flex-row flex-1 relative'>
           <VerticalNav />
           <Outlet /> 
      </div>
    </div>
  )
}

export default Main