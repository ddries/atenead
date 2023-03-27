import { app, BrowserWindow, Menu, nativeImage, Notification, shell, Tray } from 'electron'
import { release } from 'os'
import { join } from 'path'

import constants from './constants';
import * as logger from 'electron-log';
import axios from 'axios';
const log = logger.scope('window');

if (release().startsWith('6.1')) app.disableHardwareAcceleration();
if (process.platform === 'win32') app.setAppUserModelId(constants.APP_NAME);

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

export let win: BrowserWindow | null = null;
let windowIsReady: boolean = false;
let windowFinishLoad: boolean = false;

export const getCurrentBasePath = (): string => {
  if (app.isPackaged) {
    return app.getPath('exe');
  } else {
    return process.cwd();
  }
};

export const createWindowIfNotExists = () => {
    if (win) return;
    win = new BrowserWindow({
        // Window properties
        width: constants.WINDOW_WIDTH,
        height: constants.WINDOW_HEIGHT,
        minHeight: constants.WINDOW_HEIGHT,
        minWidth: constants.WINDOW_WIDTH,
        title: constants.WINDOW_TITLE,
        // icon: join(__dirname, Config.WINDOW_ICON),

        resizable: true,
        show: false,
        frame: false,

        autoHideMenuBar: true,

        // Preload script and isolate frontend from backend
        webPreferences: {
            preload: join(__dirname, '../preload/index.cjs'),
            nodeIntegration: false,
            contextIsolation: true,

            devTools: !app.isPackaged
        },
    });

    if (app.isPackaged) {
      app.commandLine.appendSwitch('disable-http-cache');
      win.loadFile(join(__dirname, '../renderer/index.html'));
        
    } else {
      const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`;
      win.loadURL(url);
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' }
    });

    win.webContents.once('dom-ready', () => {
      win?.show();
      win?.focus();
      windowFinishLoad = true;
    });

    win.once('ready-to-show', () => {
      windowIsReady = true;
    });
};

export const resolveOnWindowReady = (): Promise<void> => {
  return new Promise(res => {
    if (windowFinishLoad) res();
    else {
      win?.webContents.once('dom-ready', () => {
        res();
      });
    }
  });
};

export const hookEvents = () => {
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      app.quit();
    }
  });
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  
  app.on('second-instance', (_, argv) => {
    if (win) {
      // Focus on the main window if the user tried to open another
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });
  
  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      const __win = allWindows[0];
      if (!__win.isVisible()) {
        __win.show();
      } else {
        __win.focus();
      }
    } else {
      createWindowIfNotExists();
    }
  });
  
  // app.on('quit', () => {
  //   _discordClose();
  // });
};