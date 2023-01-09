import anylogger from '$lib/server/logger';
const ROOT_LOG = anylogger('SRV:Hook');
ROOT_LOG.info('Server Startup');

//
// Init Datastore
// ==============
//
ROOT_LOG.info('Init TVH and EPG Cache2');

// import { defaultDb } from '$lib/server/tvh/tvh-cache';
// const root_db = defaultDb;
// root_db.init();

import { MemoryStore } from '$lib/server/tvh/datastoreMemory';
// TODO add pth config and use in constructor
const db = new MemoryStore();
await db.init();

// Init pouchDB
// ============
// import { PouchStore } from '$lib/server/tvh/datastorePouchdb';
// const pouchStore = new PouchStore('/tmp/epgcache');
// await pouchStore.init();
ROOT_LOG.info('DB Initialized');
//
// HANDLE
// ======
//
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	event.locals.db = db;
	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}) satisfies Handle;
