
import { browser } from '$app/environment';
import { tvhCache ,initCache} from "$lib/server/tvh/tvh-cache"

initCache(tvhCache);

if (!browser) {
    console.log("Server Startup")
}

export {}