import { json } from '@sveltejs/kit';

import {httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('@sveltejs/kit').RequestHandler<{
 *   channelId: string;
 * }>} */
export function GET({ params,url }:{params:Record<string,string>,url:URL}) {
    const channelId = params.channelId;
    if (!tvhCache.channels.has(channelId)) {
        return httpErr404("EPG Event not found",params)
    } else {
        const body: Record<string,unknown> ={}
        body['channel'] = tvhCache.channels.get(channelId)
        return json(body)
    }
}