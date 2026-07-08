import { useApp } from './AppContext'
import Login from './component/Login'
import NavBar from './component/NavBar'
import AdminDashboard from './component/AdminDashboard'
import UserDashboard from './component/UserDashboard'
import TitleBar from './component/TitleBar'
import ToastHost from './component/Toast'

export default function App() {
  const { currentUser } = useApp()


  if (!currentUser) return (
    <div className="app">
      <TitleBar />
      <Login />
    </div>
  )


  return (
    <div className="app">
      <TitleBar />
      <NavBar />
      <main className="main-context">
        {currentUser.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
      <ToastHost/>
    </div>
  )
}