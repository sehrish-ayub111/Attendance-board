import { useState, useRef } from 'react'
import { useApp } from '../AppContext'

<<<<<<< HEAD
// Color palette used for the avatar background when no profile photo is set
=======
>>>>>>> old-hrm-project
const AVATAR_COLORS = [
  '#2f6b4f', '#e0883b', '#4a90d9', '#7b5ea7',
  '#c0524a', '#3c8b5d', '#d4a017', '#5c8a8a',
]

<<<<<<< HEAD
// Picks a consistent avatar color based on the first letter of the name
=======
>>>>>>> old-hrm-project
function avatarColor(name) {
  const index = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

<<<<<<< HEAD
// Takes an uploaded image File, center-crops it to a square, resizes it to
// 200x200, and compresses it to a JPEG data URL — keeps profile photos small
// so they can be stored cheaply (e.g. in local state/DB) without huge payloads
=======
>>>>>>> old-hrm-project
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
<<<<<<< HEAD
        const size = 200 // output width/height in pixels
=======
        const size = 200
>>>>>>> old-hrm-project
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

<<<<<<< HEAD
        // Center-crop: take the largest square from the middle of the image
        // (avoids stretching/distorting non-square photos)
=======
      
>>>>>>> old-hrm-project
        const minSide = Math.min(img.width, img.height)
        const sx = (img.width - minSide) / 2
        const sy = (img.height - minSide) / 2
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

<<<<<<< HEAD
        // Export as compressed JPEG (75% quality) data URL
=======
>>>>>>> old-hrm-project
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
<<<<<<< HEAD
    reader.readAsDataURL(file) // triggers reader.onload above once done
  })
}

// The logged-in user's own profile page — view mode shows their details,
// edit mode lets them update name/email/photo/password
export default function Profile() {
  const { currentUser, updateProfile, logout } = useApp()

  const [editMode, setEditMode] = useState(false) // toggles view vs edit form
  const [name, setName] = useState(currentUser.name || '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [newPassword, setNewPassword] = useState('') // optional password change
=======
    reader.readAsDataURL(file)
  })
}

export default function Profile() {
  const { currentUser, updateProfile, logout } = useApp()

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(currentUser.name || '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [newPassword, setNewPassword] = useState('')
>>>>>>> old-hrm-project
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photo, setPhoto] = useState(currentUser.photo || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
<<<<<<< HEAD
  const [loading, setLoading] = useState(false) // true while save request is in flight
  const fileInputRef = useRef(null) // hidden <input type="file">, triggered via "Change Photo" button

  // Handles selecting a new profile photo: validates type/size, then compresses it
=======
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

>>>>>>> old-hrm-project
  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large (max 8MB)')
      return
    }

    try {
      const compressed = await compressImage(file)
      setPhoto(compressed)
      setError('')
    } catch {
      setError('Could not process this image')
    }
  }

<<<<<<< HEAD
  // Validates the form and saves profile changes (including optional password change)
=======
>>>>>>> old-hrm-project
  async function handleSave() {
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Please fill the name field')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword && newPassword.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    setLoading(true)
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        photo,
<<<<<<< HEAD
        // Only include password in the update if the user actually typed a new one
=======
>>>>>>> old-hrm-project
        ...(newPassword ? { password: newPassword } : {}),
      })
      setSuccess('Profile updated successfully')
      setNewPassword('')
      setConfirmPassword('')
      setEditMode(false)
    } catch (err) {
      setError('Update failed: ' + err.message)
    }
    setLoading(false)
  }

<<<<<<< HEAD
  // Discards any unsaved edits and reverts form fields back to current saved values
=======
>>>>>>> old-hrm-project
  function handleCancel() {
    setName(currentUser.name || '')
    setEmail(currentUser.email || '')
    setNewPassword('')
    setConfirmPassword('')
    setPhoto(currentUser.photo || '')
    setError('')
    setEditMode(false)
  }

  return (
    <div className="profile-wrapper">
<<<<<<< HEAD
      {/* Header: avatar, name, role badge, and "Edit profile" button (view mode only) */}
=======
>>>>>>> old-hrm-project
      <div className="profile-header">
        <div className="profile-avater-lg" style={{ background: avatarColor(currentUser.name) }}>
          {currentUser.photo ? (
            <img src={currentUser.photo} alt={currentUser.name} className="profile-avater-img" />
          ) : (
            currentUser.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="profile-header-info">
          <h2 className="profile-name">{currentUser.name}</h2>
          <span className="profile-role-badge">
            {currentUser.role === 'admin' ? '🛡️ Admin' : '👤 Employee'}
          </span>
        </div>
        {!editMode && (
          <button
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => setEditMode(true)}
          >
            Edit profile
          </button>
        )}
      </div>

      <div className="profile-card">
        {!editMode ? (
<<<<<<< HEAD
          // --- View mode: read-only display of profile fields ---
=======
>>>>>>> old-hrm-project
          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-value">{currentUser.name || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{currentUser.email || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Username</span>
              <span className="profile-field-value mono">{currentUser.username}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Password</span>
<<<<<<< HEAD
              {/* Shows dots matching the password's length instead of the real value */}
=======
>>>>>>> old-hrm-project
              <span className="profile-field-value mono">{'•'.repeat(currentUser.password?.length || 6)}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Role</span>
              <span className="profile-field-value" style={{ textTransform: 'capitalize' }}>
                {currentUser.role}
              </span>
            </div>
          </div>
        ) : (
<<<<<<< HEAD
          // --- Edit mode: editable form for photo, name, email, and optional password change ---
          <div className="attendance-form">
            {/* Photo upload/preview section */}
=======
          <div className="attendance-form">
>>>>>>> old-hrm-project
            <div className="profile-photo-edit">
              <div className="profile-avater-lg profile-avater-lg-edit" style={{ background: avatarColor(currentUser.name) }}>
                {photo ? (
                  <img src={photo} alt="Preview" className="profile-avater-img" />
                ) : (
                  currentUser.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-secondary"
<<<<<<< HEAD
                  onClick={() => fileInputRef.current?.click()} // opens the hidden file picker
=======
                  onClick={() => fileInputRef.current?.click()}
>>>>>>> old-hrm-project
                >
                  Change Photo
                </button>
                {photo && (
                  <button
                    type="button"
                    className="btn btn-ghost"
<<<<<<< HEAD
                    onClick={() => setPhoto('')} // clears the selected/current photo
=======
                    onClick={() => setPhoto('')}
>>>>>>> old-hrm-project
                    style={{ marginLeft: 8 }}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
<<<<<<< HEAD
                  style={{ display: 'none' }} // hidden; triggered via the "Change Photo" button above
=======
                  style={{ display: 'none' }}
>>>>>>> old-hrm-project
                />
              </div>
            </div>

            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
              />
            </label>

            <label>
              Username
<<<<<<< HEAD
              {/* Username is shown but not editable */}
=======
>>>>>>> old-hrm-project
              <input type="text" value={currentUser.username} disabled />
            </label>

            <div className="profile-divider">
              <span>Password Change (optional)</span>
            </div>

            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </label>

<<<<<<< HEAD
            {/* Validation error / success messages */}
=======
>>>>>>> old-hrm-project
            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-danger profile-logout" onClick={logout}>
        Logout
      </button>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> old-hrm-project
