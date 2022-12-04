import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import {epgEventsQuery, EPGFilter} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

import type {RequestHandler} from './$types'
export const GET:RequestHandler = ({url})=> {
  const body = {}
  console.log(url)
  const filter= new EPGFilter(tvhCache);
  epgEventsQuery(filter, url, body,tvhCache.epgSorted);


    return json(body)
}