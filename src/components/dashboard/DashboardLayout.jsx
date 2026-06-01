import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Mobile top padding to avoid hamburger overlap */}
          <div className="md:hidden h-2" />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
