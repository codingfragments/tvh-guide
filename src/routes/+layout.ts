import type { ApiResultHealth } from '$lib/types/api';
import type { UISettings } from '$lib/types/config';

import type { LayoutLoad } from './$types';

// type DataOutput = {
//     uiCfg:UISettings
// }
// Obsolete, will not use this
// In case you like to externalize the definition you could define flat types
// and change the callback to LayoutLoad<DataOutput>

// You need to run the dev server or `svelte-kit sync` to generate them.
export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('SERVER:health', 'SERVER:cfg');
	// FUTURE Settings probably needs to go to session data, maybe
	const settings = <UISettings>await (await fetch('/api/v1/settings/ui')).json();
	const health = <ApiResultHealth>await (await fetch('/api/v1/health')).json();
	const epgDateRange = {
		epgDateFirst: new Date(health?.cache?.firstDate ?? '1.1.1990'),
		epgDateLast: new Date(health?.cache?.lastDate ?? '1.1.2100'),
		epgDateUpdated: new Date(health?.cache?.lastDate ?? '1.1.1990')
	};
	return { uiCfg: settings, serverHealth: health, epgDateRange };
};
