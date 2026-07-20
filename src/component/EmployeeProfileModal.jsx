import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'

// Formats a timestamp as "HH:MM" for display, or "--" if not recorded
function formatClock(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Color palette used for avatar backgrounds when no profile photo is set
const AVATAR_COLORS = [
  '#2f6b4f', '#e0883b', '#4a90d9', '#7b5ea7',
  '#c0524a', '#3c8b5d', '#d4a017', '#5c8a8a',
]

// Picks a consistent color for a given name (same name always gets the same color)
function avatarColor(name) {
  const index = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

// Modal showing a single employee's full profile: photo/name, today's attendance status,
// leave request summary, and an inline edit mode for updating their details
export default function EmployeeProfileModal({ user, onClose }) {
  const { attendanceRecords, leaveRecords, todayStr, updateUser } = useApp()

  const [editMode, setEditMode] = useState(false) // toggles between view mode and edit form
  const [name, setName] = useState(user.name || '')
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '')
  const [email, setEmail] = useState(user.email || '')
  const [saving, setSaving] = useState(false) // true while save request is in progress

  const today = todayStr()

  // Get this employee's most recent attendance record for today (if any)
  const todayRecord = attendanceRecords
    .filter((r) => r.userId === user.id && r.date === today)
    .sort((a, b) => b.timeInTs - a.timeInTs)[0]

  // Currently clocked in = has a record today with no time-out yet
  const clockedIn = todayRecord && !todayRecord.timeOutTs

  // This employee's leave requests, broken down by status for the summary section
  const myLeaves = leaveRecords.filter((l) => l.userId === user.id)
  const pendingLeaves = myLeaves.filter((l) => l.status === 'pending').length
  const approvedLeaves = myLeaves.filter((l) => l.status === 'approved').length
  const rejectedLeaves = myLeaves.filter((l) => l.status === 'rejected').length

  // Save edited profile fields (name/jobTitle/email), then exit edit mode
  async function handleSave() {
    setSaving(true)
    try {
      await updateUser(user.id, { name: name.trim(), jobTitle: jobTitle.trim(), email: email.trim() })
      setEditMode(false)
    } finally {
      setSaving(false) // always reset saving state, even if the update fails
    }
  }

  return (
    <Modal title="Employee Profile" onClose={onClose}>
      {/* Top section: avatar + name/job title (or editable fields when in edit mode) */}
      <div className="emp-profile-header">
        <div className="emp-profile-avatar" style={{ background: avatarColor(user.name) }}>
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="emp-profile-avatar-img" />
          ) : (
            user.name?.charAt(0).toUpperCase() // fallback: first letter of name
          )}
        </div>

        {!editMode ? (
          // Read-only view: just show name and job title as text
          <div>
            <div className="emp-profile-name">{user.name}</div>
            <div className="emp-profile-jobtitle">{user.jobTitle || 'No job title set'}</div>
          </div>
        ) : (
          // Edit mode: show input fields for name, job title, and email
          <div className="emp-profile-edit-fields">
            <label>
              Full Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Job Title
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Developer" />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      {/* Attendance & leave summary sections — hidden while in edit mode to keep focus on the form */}
      {!editMode && (
        <>
          {/* Today's attendance status */}
          <div className="emp-profile-section">
            <div className="emp-profile-row">
              <span className="emp-profile-label">Status Today</span>
              <span className={`status-pill ${clockedIn ? 'status-approved' : 'status-rejected'}`}>
                {clockedIn ? 'Active (Clocked In)' : todayRecord ? 'Clocked Out' : 'Not Clocked In'}
              </span>
            </div>
            <div className="emp-profile-row">
              <span className="emp-profile-label">Date</span>
              <span className="mono">{today}</span>
            </div>
            <div className="emp-profile-row">
              <span className="emp-profile-label">Clock In</span>
              <span className="mono">{formatClock(todayRecord?.timeInTs)}</span>
            </div>
            <div className="emp-profile-row">
              <span className="emp-profile-label">Clock Out</span>
              <span className="mono">{clockedIn ? '--' : formatClock(todayRecord?.timeOutTs)}</span>
            </div>
          </div>

          {/* Leave request counts by status */}
          <div className="emp-profile-section">
            <div className="emp-profile-row">
              <span className="emp-profile-label">Leaves — Pending</span>
              <span>{pendingLeaves}</span>
            </div>
            <div className="emp-profile-row">
              <span className="emp-profile-label">Leaves — Approved</span>
              <span>{approvedLeaves}</span>
            </div>
            <div className="emp-profile-row">
              <span className="emp-profile-label">Leaves — Rejected</span>
              <span>{rejectedLeaves}</span>
            </div>
          </div>
        </>
      )}

      {/* Footer actions: switch between "Edit" button and "Cancel/Save" buttons depending on mode */}
      <div className="modal-actions">
        {editMode ? (
          <>
            <button className="btn btn-secondary" onClick={() => setEditMode(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit
          </button>
        )}
      </div>
    </Modal>
  )
}