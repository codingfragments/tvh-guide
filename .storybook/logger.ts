import pino from 'pino';
const ROOT_LOG = pino({
	name: 'SB',
	browser: {
		asObject: true
	}
});

ROOT_LOG.level = 'debug';

// Simple anylogger adapter
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line
	return ROOT_LOG.child({ name: logger.name }) as any as Logger<BaseLevels>;
};
