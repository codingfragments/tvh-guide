import { json } from '@sveltejs/kit';

import {httpErr404} from "$lib/server/ApiHelper"
import {tvhCache} from "$lib/server/tvh/tvh-cache"

type RouteParams = { id: string }

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({params}:{params:RouteParams}){

    const epgid = params.id;
    if (!tvhCache.epg.has(epgid)) {
        throw httpErr404("EPG Event not found",params)
    } else {
        const body: Record<string,unknown> ={}
        body['event'] = tvhCache.epg.get(epgid)
        return json (body);
    }
}