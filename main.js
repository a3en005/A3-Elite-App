'use strict';

const { app, BrowserWindow, Menu, shell, ipcMain, dialog, Tray, nativeImage, Notification, session } = require('electron');
const path  = require('path');
const fs    = require('fs');

const IS_DEV = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';
const IS_LIN = process.platform === 'linux';

let mainWindow = null;
let tray       = null;

// ── Create Window ─────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 900, minHeight: 600,
    title: 'A3-Elite Market Intelligence',
    backgroundColor: '#060b14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: IS_MAC ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
  });

  // Restore last window position
  const saved = loadWindowState();
  if (saved) {
    mainWindow.setBounds(saved.bounds);
    if (saved.maximized) mainWindow.maximize();
  }

  // Relax CSP so TradingView widget + price APIs work inside Electron
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:"
        ],
      },
    });
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    if (IS_DEV) mainWindow.webContents.openDevTools();
  });

  // Intercept new-window (links) → open in OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', saveWindowState);
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── System Tray (Win / Linux) ─────────────────────────────────────────────────
function createTray() {
  if (IS_MAC) return;
  const iconFile = IS_WIN
    ? path.join(__dirname, 'build-resources', 'icon.ico')
    : path.join(__dirname, 'build-resources', 'icons', '32x32.png');

  if (!fs.existsSync(iconFile)) return;
  try {
    tray = new Tray(nativeImage.createFromPath(iconFile));
    tray.setToolTip('A3-Elite Market Intelligence');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open A3-Elite', click: () => mainWindow ? mainWindow.show() : createWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]));
    tray.on('double-click', () => mainWindow?.show());
  } catch (e) { console.warn('Tray error:', e.message); }
}

// ── App Menu ──────────────────────────────────────────────────────────────────
function buildMenu() {
  const send = (msg) => mainWindow?.webContents.send('menu-action', msg);
  const tabs = [
    ['Dashboard',        'dash-view',    '1'],
    ['Live Chart',       'live-view',    '2'],
    ['A3-Elite Analysis','ict-view',     '3'],
    ['Multi-Timeframe',  'mtf-view',     '4'],
    ['Scanner',          'scanner-view', '5'],
    ['Journal',          'journal-view', '6'],
    ['Backtest',         'bt-view',      '7'],
    ['Alerts',           'alerts-view',  '8'],
  ];

  const template = [
    ...(IS_MAC ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' },
    ]}] : []),
    { label: 'File', submenu: [
      { label: 'Export Report…',      accelerator: 'CmdOrCtrl+S',       click: () => send('export-report') },
      { label: 'Export Journal CSV…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('export-journal') },
      { type: 'separator' },
      IS_MAC ? { role: 'close' } : { role: 'quit' },
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
      { role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
      { type: 'separator' }, { role: 'togglefullscreen' },
      { type: 'separator' },
      { label: 'Developer Tools', accelerator: IS_MAC ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
        click: () => mainWindow?.webContents.toggleDevTools() },
    ]},
    { label: 'Charts', submenu: tabs.map(([label, id, num]) => ({
      label, accelerator: `CmdOrCtrl+${num}`,
      click: () => send(`tab:${id}`),
    }))},
    { label: 'Analysis', submenu: [
      { label: 'Run Analysis',       accelerator: 'CmdOrCtrl+R',       click: () => send('run-analysis') },
      { label: 'Scan All Pairs',     accelerator: 'CmdOrCtrl+Shift+R', click: () => send('scan-all') },
      { type: 'separator' },
      { label: 'Refresh Live Prices',accelerator: 'CmdOrCtrl+L',       click: () => send('refresh-prices') },
    ]},
    { label: 'Help', submenu: [
      { label: 'Documentation', click: () => shell.openExternal('https://github.com/A3EN/a3-elite') },
      { type: 'separator' },
      { label: 'About A3-Elite', click: showAbout },
    ]},
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showAbout() {
  dialog.showMessageBox(mainWindow || undefined, {
    type: 'info',
    title: 'About A3-Elite',
    message: 'A3-Elite Market Intelligence  v2.0.0',
    detail: [
      'Professional trading analysis powered by ICT Smart Money Concepts.',
      '',
      'Features: Unicorn Model • Order Blocks • FVGs • Breaker Blocks',
      'SMT Divergence • AMD Cycle • Kill Zones • Silver Bullet',
      'Multi-TF Confluence • Trade Journal • Backtester • Scanner',
      '',
      '⚠  For educational purposes only. Not financial advice.',
    ].join('\n'),
    buttons: ['OK'],
  });
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────
function registerIPC() {
  ipcMain.handle('save-file', async (_e, { defaultName, content, filters }) => {
    if (!mainWindow) return { success: false };
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title:       'Export A3-Elite File',
      defaultPath: defaultName || 'a3-elite-export.html',
      filters:     filters || [{ name: 'HTML File', extensions: ['html'] }],
    });
    if (canceled || !filePath) return { success: false };
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true, filePath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('show-notification', (_e, { title, body }) => {
    if (Notification.isSupported()) new Notification({ title, body }).show();
  });

  ipcMain.handle('open-external', (_e, url) => {
    if (url.startsWith('https://')) shell.openExternal(url);
  });
}

// ── Window State ──────────────────────────────────────────────────────────────
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return null; }
}

function saveWindowState() {
  if (!mainWindow) return;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      bounds:    mainWindow.getBounds(),
      maximized: mainWindow.isMaximized(),
    }), 'utf8');
  } catch {}
}

// ── Single Instance Lock ──────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIPC();
    buildMenu();
    createWindow();
    createTray();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (!IS_MAC) app.quit();
});
