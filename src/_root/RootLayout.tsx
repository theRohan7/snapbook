import Bottombar from '@/components/shared/Bottombar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import Topbar from '@/components/shared/Topbar'
import { Outlet } from 'react-router-dom'

function RootLayout() {
  return (
    <div className='w-full md:flex'>
      <Topbar />
      <LeftSidebar />

      <section className='flex fle-1 h-full'>
        <Outlet />
      </section>

      <Bottombar />
      
    </div>
  )
}

export default RootLayout
