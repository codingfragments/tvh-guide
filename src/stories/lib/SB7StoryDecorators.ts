import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function wrapThemedContext(wrapper: any = ThemedStorybookContainer) {
	return (_: any, c: { globals: any }): any => {
		const container = wrapper;
		(<any>window).sb7_globals = c.globals;
		if ((<any>window).sb7_chkGlobals_container) (<any>window).sb7_chkGlobals_container();
		return container;
	};
}

export function wrapContext(story: any, c: any) {
	(<any>window).sb7_globals = c.globals;
	if ((<any>window).sb7_chkGlobals_container) (<any>window).sb7_chkGlobals_container();

	return story(c);
}

export function contextPlay() {}
export function decorate(wrapper: any) {
	return (): any => {
		return wrapper;
	};
}
