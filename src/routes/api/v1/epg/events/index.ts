import type { RequestHandlerOutput } from "@sveltejs/kit";

import {SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function get({url}) :Promise<RequestHandlerOutput>{
    const range=new SearchRange()
    range.fromUrl(url)
    const events = tvhCache.getEpgEntriesByTime(range.first,range.last)
    const body = {}
    range.fillResponseInfo(body,tvhCache.epg.size)
    body["events"]=events

    return {
      body: body
    };
}