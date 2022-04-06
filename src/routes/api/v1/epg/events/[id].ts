import type { RequestHandlerOutput } from "@sveltejs/kit";

import {httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function get({params}) :Promise<RequestHandlerOutput>{
    const epgid = params.id;
    if (!tvhCache.epg.has(epgid)) {
        return httpErr404("EPG Event not found",params)
    } else {
        const body ={}
        body['event'] = tvhCache.epg.get(epgid)
        return {body: body };
    }
}