const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 580,
    minWidth: 260,
    minHeight: 420,
    title: 'totoist',
    backgroundColor: '#f7f7f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
}

ipcMain.handle('save-file', async (event, content) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: 'totoist.txt',
    filters: [{ name: 'Text', extensions: ['txt'] }]
  });
  if (canceled || !filePath) return false;
  await fs.writeFile(filePath, content, 'utf8');
  return true;
});

ipcMain.handle('load-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Text', extensions: ['txt'] }]
  });
  if (canceled || !filePaths[0]) return null;
  return fs.readFile(filePaths[0], 'utf8');
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
