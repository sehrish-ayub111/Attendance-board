import { useApp } from '../AppContext'

<<<<<<< HEAD
// Top navigation bar shown on every page after login.
// Displays the app brand, a notification bell (admin only) for pending leave
// requests, the current user's avatar/name (click to view profile), and logout.
export default function NavBar() {
  const { currentUser, logout, leaveRecords, goToPendingLeaves, goToProfile } = useApp()

  // Count of leave requests still awaiting approval, shown as a badge on the bell icon
=======
export default function NavBar() {
  const { currentUser, logout, leaveRecords, goToPendingLeaves, goToProfile } = useApp()

>>>>>>> old-hrm-project
  const pendingCount = leaveRecords.filter((r) => r.status === 'pending').length

  return (
    <header className="navbar">
<<<<<<< HEAD
      {/* App brand/logo on the left */}
=======
>>>>>>> old-hrm-project
      <div className="navbar-brand">
        <span className="brand-mark">⏱</span>
        <span>TimeTrack</span>
      </div>
<<<<<<< HEAD

      <div className="navbar-user">
        {/* Notification bell — only visible to admins, jumps to pending leave requests */}
=======
      <div className="navbar-user">
>>>>>>> old-hrm-project
        {currentUser.role === 'admin' && (
          <button
            className="notif-bell"
            onClick={goToPendingLeaves}
            title="Pending Leave Requests"
          >
            🔔
<<<<<<< HEAD
            {/* Only show the badge count if there's at least one pending request */}
=======
>>>>>>> old-hrm-project
            {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
          </button>
        )}

<<<<<<< HEAD
        {/* Clickable user chip — avatar + name, opens the current user's profile */}
=======
>>>>>>> old-hrm-project
        <button className="user-chip" onClick={goToProfile} title="View Profile">
          <div className="user-chip-avatar">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt={currentUser.name} className="user-chip-avatar-img" />
            ) : (
<<<<<<< HEAD
              currentUser.name?.charAt(0).toUpperCase() // fallback: first letter of name if no photo
=======
              currentUser.name?.charAt(0).toUpperCase()
>>>>>>> old-hrm-project
            )}
          </div>
          <span className="user-name">{currentUser.name}</span>
        </button>
<<<<<<< HEAD

        {/* Logout button */}
=======
>>>>>>> old-hrm-project
        <button className="btn btn-ghost" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}