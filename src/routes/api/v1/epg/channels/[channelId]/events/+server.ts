
import {epgEventsQuery, EPGFilter, httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"
import type { ITVHChannel, ITVHEpgEvent } from "$lib/types/epg-interfaces";

import { json } from '@sveltejs/kit';

import type {RequestHandler} from './$types'
export const GET:RequestHandler = ({params,url})=> {
    const channelId = params.channelId;
    if (!tvhCache.channels.has(channelId)) {
        throw httpErr404("Channel not found",params)
    }
    const body:Record<string,unknown>  ={}
    body['channel'] = tvhCache.channels.get(channelId)


    const filter= new EPGFilter(tvhCache);
    filter.addChannel(tvhCache.channels.get(channelId) as ITVHChannel);
    epgEventsQuery(filter, url, body,tvhCache.epgSorted);

    return json(body);

}
