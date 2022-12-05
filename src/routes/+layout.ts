import type { UISettings } from '$lib/types/config';

import type { LayoutLoad } from './$types';

// type DataOutput = {
//     uiCfg:UISettings
// }
// Obsolete, will not use this
// In case you like to externalize the definition you could define flat types
// and change the callback to LayoutLoad<DataOutput>

// You need to run the dev server or `svelte-kit sync` to generate them.
export const load: LayoutLoad = async ({ fetch }) => {
	const settings = <UISettings>await (await fetch('/api/v1/settings/ui')).json();
	return { uiCfg: settings };
};
