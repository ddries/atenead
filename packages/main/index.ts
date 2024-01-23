import { app } from 'electron';
import { ProgressInfo, UpdateInfo, autoUpdater } from 'electron-updater';

import { hookEvents, createWindowIfNotExists, resolveOnWindowReady } from './window';
import { initialize as _scraperInitialize } from './scrapper';

import * as pjson from '../../package.json';

import './ipcMain';
import { loadFrontend, setUpdateLabel, setUpdatePbMode, setUpdateProgress, setView } from './ipcMain';

import log from 'electron-log';
const logger = log.scope('index');

export let version: string = "";

(async () => {
  hookEvents();
  logger.info('hooked events');

  await app.whenReady();

  await _scraperInitialize();

  createWindowIfNotExists();
  logger.info('app ready window open');

  version = pjson.commit;

  await resolveOnWindowReady();
  logger.info('window ready');

  logger.info('load frontend');
  loadFrontend();

  if (app.isPackaged) {
    autoUpdater.autoDownload = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.autoInstallOnAppQuit = true;

    const _onUpdateNotAvailable = (i: UpdateInfo) => {
      autoUpdater.off('update-not-available', _onUpdateNotAvailable);
      setView(0);
    };

    const _onProgress = (p: ProgressInfo) => {
      setUpdateProgress(p.percent);
    }

    const _onDownloaded = () => {
      setUpdateLabel("Installing...");
      autoUpdater.quitAndInstall(false, true);
    }

    const _onUpdateAvailable = (i: UpdateInfo) => {
      setUpdateLabel('Updating to ' + i.version);
      setUpdatePbMode('determinate');
      autoUpdater.on('download-progress', _onProgress);
      autoUpdater.on('update-downloaded', _onDownloaded);

      autoUpdater.downloadUpdate();

      autoUpdater.off('update-available', _onUpdateAvailable);
    };

    autoUpdater.once('update-available', _onUpdateAvailable);
    autoUpdater.once('update-not-available', _onUpdateNotAvailable);

    autoUpdater.checkForUpdates();
  } else {
    setView(0);
  }

  logger.info('startup complete');
})();