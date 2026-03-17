'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // Save file via native OS dialog
  saveFile: (defaultName, content, filters) =>
    ipcRenderer.invoke('save-file', { defaultName, content, filters }),

  // Native OS notification
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  // Open URL in default OS browser
  openExternal: (url) =>
    ipcRenderer.invoke('open-external', url),

  // Listen for menu commands from the main process
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action));
  },
});
