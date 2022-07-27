import type { RequestHandlerOutput } from "@sveltejs/kit";

import {epgEventsQuery, EPGFilter} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./').RequestHandler} */
export async function GET({url}) :Promise<RequestHandlerOutput>{
  const body = {}
  const filter= new EPGFilter(tvhCache);
  epgEventsQuery(filter, url, body,tvhCache.epgSorted);


    return {
      body: body
    };
}