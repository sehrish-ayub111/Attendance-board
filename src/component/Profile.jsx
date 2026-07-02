import { useState, useRef } from 'react'
import { useApp } from '../AppContext'

const AVATAR_COLORS = [
  '#2f6b4f', '#e0883b', '#4a90d9', '#7b5ea7',
  '#c0524a', '#3c8b5d', '#d4a017', '#5c8a8a',
]

function avatarColor(name) {
  const index = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const size = 200
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

      
        const minSide = Math.min(img.width, img.height)
        const sx = (img.width - minSide) / 2
        const sy = (img.height - minSide) / 2
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Profile() {
  const { currentUser, updateProfile, logout } = useApp()

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(currentUser.name || '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photo, setPhoto] = useState(currentUser.photo || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

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
          <div className="attendance-form">
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </button>
                {photo && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPhoto('')}
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
                  style={{ display: 'none' }}
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
}
