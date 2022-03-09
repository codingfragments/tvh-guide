
import { browser } from '$app/env';
import { tvhCache ,initCache} from "$lib/server/tvh/tvh-cache"

initCache(tvhCache);





if (!browser) {
    console.log("Server Startup")
}

export {}