import { useEffect, useState } from 'react'

// Custom title bar for the Electron desktop app (replaces the OS's native
// title bar, since the main window is created with `frame: false`).
// Renders nothing in a regular browser — only shows up when running inside Electron.
export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  // Detect whether we're running inside Electron (electronAPI is exposed via preload.js)
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron

  // Subscribe to maximize/unmaximize events from the main process,
  // so the maximize button icon can update accordingly
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.onMaximizedChange(setIsMaximized)
  }, [isElectron])

  // Don't render anything if not running inside Electron (e.g. regular web browser)
  if (!isElectron) return null

  return (
    <div className="electron-titlebar">
      {/* Left side: app logo/title — this area is draggable to move the window
          (dragging behavior handled via CSS, e.g. -webkit-app-region: drag) */}
      <div className="electron-titlebar-drag">
        <span className="electron-titlebar-logo">⏱️</span>
        <span className="electron-titlebar-title">TimeTrack</span>
      </div>

      {/* Right side: window control buttons (minimize / maximize / close) */}
      <div className="electron-titlebar-controls">
        {/* Minimize button */}
        <button
          className="electron-titlebar-btn"
          onClick={() => window.electronAPI.minimize()}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1.4" fill="currentColor" />
          </svg>
        </button>

        {/* Maximize/restore button — icon changes depending on current window state */}
        <button
          className="electron-titlebar-btn"
          onClick={() => window.electronAPI.maximizeToggle()}
          aria-label="Maximize"
        >
          {isMaximized ? (
            // "Restore" icon (overlapping squares) shown when window is currently maximized
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2.5" y="1" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="3.5" width="7" height="7" fill="#006d5b" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          ) : (
            // "Maximize" icon (single square) shown when window is not maximized
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1.2" y="1.2" width="9.6" height="9.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          )}
        </button>

        {/* Close button */}
        <button
          className="electron-titlebar-btn electron-titlebar-close"
          onClick={() => window.electronAPI.close()}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}