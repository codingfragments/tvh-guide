import type { RequestHandlerOutput } from "@sveltejs/kit";

import {epgEventsQuery, EPGFilter, httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"
import type { ITVHEpgEvent } from "$lib/types/epg-interfaces";

/** @type {import('./').RequestHandler} */
export async function get({url,params}) :Promise<RequestHandlerOutput>{
    const channelId = params.channelId;
    if (!tvhCache.channels.has(channelId)) {
        return httpErr404("Channel not found",params)
    }
    const body ={}
    body['channel'] = tvhCache.channels.get(channelId)


    const filter= new EPGFilter(tvhCache);
    filter.addChannel(body['channel']);
    epgEventsQuery(filter, url, body,tvhCache.epgSorted);

    return {
      body: body
    };
}
