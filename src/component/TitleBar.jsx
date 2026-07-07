import { useEffect, useState } from 'react'


export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron

  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.onMaximizedChange(setIsMaximized)
  }, [isElectron])

  if (!isElectron) return null

  return (
    <div className="electron-titlebar">
      <div className="electron-titlebar-drag">
        <span className="electron-titlebar-logo">⏱️</span>
        <span className="electron-titlebar-title">TimeTrack</span>
      </div>

      <div className="electron-titlebar-controls">
        <button
          className="electron-titlebar-btn"
          onClick={() => window.electronAPI.minimize()}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1.4" fill="currentColor" />
          </svg>
        </button>

        <button
          className="electron-titlebar-btn"
          onClick={() => window.electronAPI.maximizeToggle()}
          aria-label="Maximize"
        >
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2.5" y="1" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="3.5" width="7" height="7" fill="#006d5b" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1.2" y="1.2" width="9.6" height="9.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          )}
        </button>

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
