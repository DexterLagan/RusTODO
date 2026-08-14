const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('totoist', {
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  loadFile: () => ipcRenderer.invoke('load-file')
});
