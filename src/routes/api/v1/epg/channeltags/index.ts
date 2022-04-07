import type { RequestHandlerOutput } from "@sveltejs/kit";

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function get() :Promise<RequestHandlerOutput>{

    const tags = tvhCache.channelTags
    const body = {}

    body["tags"]=tags
    return {
      body: body
    };
}