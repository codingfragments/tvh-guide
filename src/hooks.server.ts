import anylogger from '$lib/server/logger';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { debounce } from 'ts-debounce';

import { MemoryStore } from '$lib/server/tvh/datastoreMemory';
import { PouchStore } from '$lib/server/tvh/datastorePouchdb';
import type { DataStore } from '$lib/server/types/database';
import { isTrueish } from '$lib/tools';

const ROOT_LOG = anylogger('SRV:Hook');
ROOT_LOG.info('Server Startup');

// GC Stats to track memory usage
// ==============================
import GCStats from 'gc-stats';

if (isTrueish(env.SERVER_LOG_MEM)) {
	const gc = GCStats();

	gc.on(
		'stats',
		debounce(
			(stats) => {
				ROOT_LOG.debug({ msg: 'MEM Stats', stats });
			},
			1000,
			{ isImmediate: true }
		)
	);
}

//
// Init Datastore
// ==============
//
ROOT_LOG.info('Init TVH and EPG Cache2');

// import { defaultDb } from '$lib/server/tvh/tvh-cache';
// const root_db = defaultDb;
// root_db.init();

// TODO add pth config and use in constructor
let db: DataStore | undefined = undefined;
switch (env.SERVER_DB_TYPE ?? 'memory') {
	case 'memory':
		ROOT_LOG.info('Init MemoryDB');
		db = new MemoryStore(
			env.SERVER_DB_MEMORY_PATH,
			Number(env.SERVER_TVH_RELOAD_TIME ?? '60'),
			Number(env.SERVER_TVH_RETRY_TIME ?? '1'),
			Number(env.SERVER_TVH_MAX_RETRIES ?? '5')
		);
		break;
	case 'pouchdb':
		ROOT_LOG.info({ msg: 'Init PouchDB', path: env.SERVER_DB_POUCHDB_PATH });
		db = new PouchStore(
			env.SERVER_DB_POUCHDB_PATH,
			Number(env.SERVER_TVH_RELOAD_TIME ?? '60'),
			Number(env.SERVER_TVH_RETRY_TIME ?? '1'),
			Number(env.SERVER_TVH_MAX_RETRIES ?? '5')
		);
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

export const handle = (async ({ event, resolve }) => {
	if (db) event.locals.db = db;
	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}) satisfies Handle;
