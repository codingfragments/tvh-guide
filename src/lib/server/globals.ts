import fs from 'fs';
import type { Settings } from '$lib/types/config';
import anylogger from 'anylogger';
const LOG = anylogger('server');

function loadCfg(cfgFile = './static/config.json') {
	const jsonData = fs.readFileSync(cfgFile, 'utf8');
	const jsonObj = JSON.parse(jsonData);
	LOG.info('Server loaded');
	return <Settings>jsonObj;
}

const cfg = loadCfg();
export const serverCfg = cfg.server;
export const uiCfg = cfg.ui;
