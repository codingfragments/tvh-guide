

import type { RequestHandlerOutput } from "@sveltejs/kit";
import {tvhCache} from "$lib/server/tvh/tvh-cache"
/** @type {import('./').RequestHandler} */
export async function get() :Promise<RequestHandlerOutput>{


    const body = {}
    body["health"]="OK"
    body["cache"]=tvhCache.status

    return {
      body: body
    };
}
