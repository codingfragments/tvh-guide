export const SECONDS_FROM_MS = 1000;
export const MINUTES_FROM_MS = 1000 * 60;
export const HOURS_FROM_MS = MINUTES_FROM_MS * 60;
export const DAYS_FROM_MS = HOURS_FROM_MS * 24;

export function hours(hours: number) {
	return HOURS_FROM_MS * hours;
}
export function minutes(minutes: number) {
	return MINUTES_FROM_MS * minutes;
}
export function seconds(seconds: number) {
	return SECONDS_FROM_MS * seconds;
}

export function days(days: number) {
	return DAYS_FROM_MS * days;
}
