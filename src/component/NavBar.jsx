import { useApp } from '../AppContext'

export default function NavBar() {
  const { currentUser, logout, leaveRecords, goToPendingLeaves, goToProfile } = useApp()

  const pendingCount = leaveRecords.filter((r) => r.status === 'pending').length

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">⏱</span>
        <span>TimeTrack</span>
      </div>
      <div className="navbar-user">
        {currentUser.role === 'admin' && (
          <button
            className="notif-bell"
            onClick={goToPendingLeaves}
            title="Pending Leave Requests"
          >
            🔔
            {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
          </button>
        )}

        <button className="user-chip" onClick={goToProfile} title="View Profile">
          <div className="user-chip-avatar">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt={currentUser.name} className="user-chip-avatar-img" />
            ) : (
              currentUser.name?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="user-name">{currentUser.name}</span>
        </button>
        <button className="btn btn-ghost" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}