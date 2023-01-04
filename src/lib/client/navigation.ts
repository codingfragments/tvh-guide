import { v4 as uuidv4 } from 'uuid';

type NavEvent = {
	url?: URL;
	navigateHistoryBack?: boolean;
	showLoadSpinner: boolean;
};
export type NavigationCallback = (nav: NavEvent) => Promise<void>;

const callbacks = new Map<string, NavigationCallback>();

async function callEachCallback(event: NavEvent) {
	for (const cb of callbacks.values()) {
		await cb(event);
	}
}
export function registerNavigationCallback(cb: NavigationCallback) {
	const uuid = uuidv4();
	callbacks.set(uuid, cb);
	return () => {
		callbacks.delete(uuid);
	};
}

export function navigateBack(showLoadSpinner = false) {
	callEachCallback({ navigateHistoryBack: true, showLoadSpinner });
	history.back();
}
