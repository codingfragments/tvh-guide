
import pino from 'pino';
const ROOT_LOG = pino({
	name: 'SB',
	browser: {
		asObject: true
	}
});

ROOT_LOG.level = "debug";
console.log('ROOT Loglevel set to ' + ROOT_LOG.level, ROOT_LOG);

// Simple anylogger adapter
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line
	return ROOT_LOG.child({ name: logger.name }) as any as Logger<BaseLevels>;
};
