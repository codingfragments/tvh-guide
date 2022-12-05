import fs from 'fs';
import type { Settings } from '$lib/types/config';

function loadCfg(cfgFile = './static/config.json') {
	const jsonData = fs.readFileSync(cfgFile, 'utf8');
	const jsonObj = JSON.parse(jsonData);
	console.log('Server loaded');
	return <Settings>jsonObj;
}

const cfg = loadCfg();
export const serverCfg = cfg.server;
export const uiCfg = cfg.ui;
