import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

import pino from 'pino';
const ROOT_LOG = pino({
	name: 'ROOT',
	browser: {
		asObject: true
	}
});

ROOT_LOG.level = env.PUBLIC_CLIENT_LOG_LEVEL;
console.log('ROOT Loglevel set to ' + ROOT_LOG.level, ROOT_LOG);

// Simple anylogger adapter
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line
	return ROOT_LOG.child({ name: logger.name }) as any as Logger<BaseLevels>;
};

if (!browser) {
	console.error('Client hook on server !!!!');
}
export {};
