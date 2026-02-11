import fs from 'fs';
import type { Settings } from '$lib/types/config';
import anylogger from 'anylogger';
import { env } from '$env/dynamic/private';

const LOG = anylogger('server');

function loadCfg(cfgFile = './static/config.json') {
	const jsonData = fs.readFileSync(cfgFile, 'utf8');
	const jsonObj = JSON.parse(jsonData);
	LOG.info('Server loaded');
	return <Settings>jsonObj;
}

const cfg = loadCfg();
export const serverCfg = cfg.server;

// Allow Override

serverCfg.tvheadend.host = env.SERVER_TVH_SERVER || serverCfg.tvheadend.host;
serverCfg.tvheadend.port = Number(env.SERVER_TVH_PORT || serverCfg.tvheadend.port);
serverCfg.tvheadend.username = env.SERVER_TVH_USERNAME || serverCfg.tvheadend.username;
serverCfg.tvheadend.password = env.SERVER_TVH_PASSWORD || serverCfg.tvheadend.password;

export const uiCfg = cfg.ui;
