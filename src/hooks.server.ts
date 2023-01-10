import anylogger from '$lib/server/logger';
import { env } from '$env/dynamic/private';

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
import { PouchStore } from '$lib/server/tvh/datastorePouchdb';
import type { DataStore } from '$lib/server/types/database';

// TODO add pth config and use in constructor
let db: DataStore | undefined = undefined;
switch (env.SERVER_DB_TYPE ?? 'memory') {
	case 'memory':
		ROOT_LOG.info('Init MemoryDB');
		db = new MemoryStore();
		break;
	case 'pouchdb':
		ROOT_LOG.info({ msg: 'Init PouchDB', path: env.SERVER_DB_POUCHDB_PATH });
		db = new PouchStore(env.SERVER_DB_POUCHDB_PATH);
		break;
}
if (db) {
	await db.init();
}
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
	if (db) event.locals.db = db;
	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}) satisfies Handle;
