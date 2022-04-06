import type { RequestHandlerOutput } from "@sveltejs/kit";

import {EPGFilter, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"
import type { ITVHEpgEvent } from "$lib/types/epg-interfaces";

/** @type {import('./').RequestHandler} */
export async function get({url,params}) :Promise<RequestHandlerOutput>{
    const channelId = params.channelId;
    if (!tvhCache.channels.has(channelId)) {
        return httpErr404("EPG Event not found",params)
    }
    const body ={}
    body['channel'] = tvhCache.channels.get(channelId)


    // TODO Refactor these different shortcuts
    const filter= new EPGFilter(tvhCache);
    filter.addChannel(body['channel']);
    const range=new SearchRange<ITVHEpgEvent>()

    filter.fromUrl(url);
    range.fromUrl(url);

    const  filteredEvents = filter.filter(tvhCache.epgSorted)
    const events = range.filter(filteredEvents)
    range.fillResponseInfo(body,filteredEvents.length);
    body["events"]=events

    return {
      body: body
    };
}