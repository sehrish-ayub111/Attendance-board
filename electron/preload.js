// Bridge between frontend and Electron backend
const { contextBridge, ipcRenderer } = require('electron')

// Expose safe functions to the frontend
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true, // so frontend can check if it's running inside Electron

  minimize: () => ipcRenderer.send('window:minimize'), // minimize window
  maximizeToggle: () => ipcRenderer.send('window:maximize-toggle'), // maximize/unmaximize
  close: () => ipcRenderer.send('window:close'), // close window

  // Notify frontend when maximize status changes
  onMaximizedChange: (callback) =>
    ipcRenderer.on('window:maximized', (_event, isMaximized) => callback(isMaximized)),
})