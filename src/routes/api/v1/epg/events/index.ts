import type { RequestHandlerOutput } from "@sveltejs/kit";

import {EPGFilter, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function get({url}) :Promise<RequestHandlerOutput>{
    const filter= new EPGFilter(tvhCache);
    const range=new SearchRange()

    filter.fromUrl(url);
    range.fromUrl(url);

    console.log(filter)
    const  filteredEvents = filter.filter(tvhCache.epgSorted)
    const events = range.filter(filteredEvents)
    const body = {}
    range.fillResponseInfo(body,filteredEvents.length);
    body["events"]=events

    return {
      body: body
    };
}