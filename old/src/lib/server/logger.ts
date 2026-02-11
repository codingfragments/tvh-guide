import { env } from '$env/dynamic/private';
import pino, { levels } from 'pino';

//
// Define LOGGER and global Logging Config
// ========================================
//
const ROOT_LOG = pino({
	base: {},
	mixin(_context, level) {
		return { 'level-label': levels.labels[level] };
	},
	timestamp: pino.stdTimeFunctions.isoTime
});

ROOT_LOG.level = env.SERVER_LOG_LEVEL ?? 'debug';
console.log('LOG LEVEL', ROOT_LOG.level);

//
// Simple anylogger adapter
// ========================
//
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	return ROOT_LOG.child({ name: logger.name }) as any as Logger<BaseLevels>;
};

export default anylogger;
