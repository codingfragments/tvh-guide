import type { RequestHandlerOutput } from "@sveltejs/kit";

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function GET() :Promise<RequestHandlerOutput>{

    const tags = tvhCache.genres
    const body = {}

    body["tags"]=tags
    return {
      body: body
    };
}