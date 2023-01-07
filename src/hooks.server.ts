import { env } from '$env/dynamic/private';
import pino, { levels } from 'pino';

//
// Define LOGGER and global Logging Config
// ========================================
//
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

//
// Simple anylogger adapter
// ========================
//
import anylogger from 'anylogger';
import type { Logger, BaseLevels } from 'anylogger';
anylogger.ext = (logger) => {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	return ROOT_LOG.child({ chld: logger.name }) as any as Logger<BaseLevels>;
};

ROOT_LOG.info('Server Startup');

//
// Init Datastore
// ==============
//
ROOT_LOG.info('Init TVH and EPG Cache2');

import { defaultDb } from '$lib/server/tvh/tvh-cache';
const root_db = defaultDb;
root_db.init();

// Init pouchDB
// ============
// import { PouchStore } from '$lib/server/tvh/datastorePouchdb';
// const pouchStore = new PouchStore('/tmp/epgcache');
// await pouchStore.init();
ROOT_LOG.info('POUCHDB Initialized');
//
// HANDLE
// ======
//
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	event.locals.db = pouchStore;
	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}) satisfies Handle;
