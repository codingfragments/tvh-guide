function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleep(time: number) {
	await timeout(time);
}

export function floorDate(d: Date): Date {
	const d2 = new Date(d.getTime());
	d2.setHours(0);
	d2.setMinutes(0);
	d2.setSeconds(0);
	d2.setMilliseconds(0);
	return d2;
}
export function extractTime(timestamp: Date) {
	const dateOffset = new Date(timestamp.toDateString()).getTime();
	return new Date(timestamp.getTime() - dateOffset);
}

export function mergeDate(day: Date, time: Date) {
	const delta = extractTime(time).getTime();

	return new Date(floorDate(day).getTime() + delta);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exists(prop: any) {
	return prop === undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toBool(prop: any) {
	if (prop === undefined) return false;
	if (prop) return true;
	else return false;
}
