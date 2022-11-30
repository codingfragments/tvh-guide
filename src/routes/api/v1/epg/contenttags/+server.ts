
import { json } from '@sveltejs/kit';

import {tvhCache} from "$lib/server/tvh/tvh-cache"


/** @type {import('./$types').RequestHandler} */
export function GET({ }) {
    const tags = tvhCache.genres
    return json ({tags: tags})
}