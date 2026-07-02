import { useApp } from './AppContext'
import Login from './component/Login'
import NavBar from './component/NavBar'
import AdminDashboard from './component/AdminDashboard'
import UserDashboard from './component/UserDashboard'

export default function App() {
  const { currentUser } = useApp()

 
  if (!currentUser) return <Login />


  return (
    <div className="app">
      <NavBar />
      <main className="main-context">
        {currentUser.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  )
}