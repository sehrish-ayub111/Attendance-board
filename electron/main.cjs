// Electron modules import
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// Dev mode check
const isDev = !app.isPackaged

let mainWindow

// Function to create the window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false, // default title bar hidden, using custom buttons instead
    backgroundColor: '#f5f5f3',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // security
      nodeIntegration: false, // security
    },
  })

  // Load content depending on dev vs production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Send maximize/unmaximize status to frontend
  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false))
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow()

  // Mac: create a new window if dock is clicked and no window exists
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit app when all windows are closed (except on Mac)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC events for custom title bar buttons
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize-toggle', () => {
  if (!mainWindow) return
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())