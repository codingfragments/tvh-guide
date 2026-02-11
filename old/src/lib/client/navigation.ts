import { goto } from '$app/navigation';
import { v4 as uuidv4 } from 'uuid';

type NavEvent = {
	url?: string | URL;
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

// CHECK THIS out

export function navigateBack(showLoadSpinner = false) {
	callEachCallback({ navigateHistoryBack: true, showLoadSpinner }).then(() => {
		history.back();
	});
}

export async function gotoWithCallbacks(
	url: string | URL,
	showLoadSpinner = false, // should this get
	opts?:
		| {
				replaceState?: boolean | undefined;
				noScroll?: boolean | undefined;
				keepFocus?: boolean | undefined;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				state?: any;
				invalidateAll?: boolean | undefined;
		  }
		| undefined
) {
	callEachCallback({ url, navigateHistoryBack: false, showLoadSpinner }).then(() => {
		goto(url, opts);
	});
}
