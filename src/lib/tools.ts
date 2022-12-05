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

export function mergeDate(day: Date, time: Date) {
	const plain = floorDate(time);
	const delta = time.getTime() - plain.getTime();
	return new Date(day.setMilliseconds(delta));
}

export function exists(prop: any) {
	return prop === undefined;
}

export function toBool(prop: any) {
	if (prop === undefined) return false;
	if (prop) return true;
	else return false;
}
