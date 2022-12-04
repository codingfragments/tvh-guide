import { json } from '@sveltejs/kit';

import {tvhCache} from "$lib/server/tvh/tvh-cache"


import type {RequestHandler} from './$types'
export const GET:RequestHandler = ()=> {

    const tags = tvhCache.channelTags
    const body :Record<string,unknown> = {}

    body["tags"]=tags
    return json(body);
}