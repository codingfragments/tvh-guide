import anylogger from 'anylogger';

function createLogger(name = 'default') {
	const logger = anylogger(name);
	logger.info();
	return logger;
}

export default createLogger;
