type fetchFun = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

export async function apiGetEvent(fetch: fetchFun, eventId: string) {
	return fetch(`/api/v1/epg/events/${eventId}`);
}
