import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import {epgEventsQuery, EPGFilter} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('./$types').RequestHandler} */
export function GET({ url }:{url:URL}) {
  const body = {}
  const filter= new EPGFilter(tvhCache);
  epgEventsQuery(filter, url, body,tvhCache.epgSorted);


    return json(body)
}