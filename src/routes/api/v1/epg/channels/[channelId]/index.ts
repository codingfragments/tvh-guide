import type { RequestHandlerOutput } from "@sveltejs/kit";

import {httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function get({params}) :Promise<RequestHandlerOutput>{
    const channelId = params.channelId;
    if (!tvhCache.channels.has(channelId)) {
        return httpErr404("EPG Event not found",params)
    } else {
        const body ={}
        body['channel'] = tvhCache.channels.get(channelId)
        return {body: body };
    }
}