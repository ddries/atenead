import { app } from 'electron';

import { hookEvents, createWindowIfNotExists, resolveOnWindowReady } from './window';
import { initialize as _scraperInitialize } from './scrapper';

import * as pjson from '../../package.json';

import './ipcMain';
import { loadFrontend } from './ipcMain';

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

  logger.info('startup complete');
})();