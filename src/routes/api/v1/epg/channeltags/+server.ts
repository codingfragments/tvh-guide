import { json } from '@sveltejs/kit';

import {tvhCache} from "$lib/server/tvh/tvh-cache"


/** @type {import('./$types').RequestHandler} */
export function GET({ url }:{url:URL}) {

    const tags = tvhCache.channelTags
    const body :Record<string,unknown> = {}

    body["tags"]=tags
    return json(body);
}