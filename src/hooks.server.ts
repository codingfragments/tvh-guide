import { env } from '$env/dynamic/private';
import pino, { levels } from 'pino';

const ROOT_LOG = pino({
	name: 'ROOT_APP',
	base: {},
	mixin(_context, level) {
		return { 'level-label': levels.labels[level] };
	},
	timestamp: pino.stdTimeFunctions.isoTime
});

ROOT_LOG.level = env.SERVER_LOG_LEVEL;
console.log('LOG LEVEL', ROOT_LOG.level);
// Simple anylogger adapter
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	return ROOT_LOG.child({ chld: logger.name }) as any as Logger<BaseLevels>;
};

import { browser } from '$app/environment';
import { tvhCache, initCache } from '$lib/server/tvh/tvh-cache';

initCache(tvhCache);

if (!browser) {
	ROOT_LOG.info('Server Startup');
}

export {};
