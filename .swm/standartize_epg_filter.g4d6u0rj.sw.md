---
title: Standartize_EPG_Filter
---
# Introduction

This document will walk you through the implementation of the "Standardize EPG Filter" feature. The feature was designed to standardize the way Electronic Program Guide (EPG) data is filtered across different parts of the application. This was achieved by creating a reusable filter function and applying it in various parts of the codebase.

We will cover:

1. The design and implementation of the EPG filter function.


2. How the filter function is used in different parts of the application.


3. The creation of a URL filter class to handle URL-based filtering.


4. The integration of the filter function with the database.

# EPG filter function

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="141">

---

The EPG filter function is defined in the <SwmPath>[src/lib/server/tvh/datastoreGlobals.ts](/src/lib/server/tvh/datastoreGlobals.ts)</SwmPath> file. This function takes an array of EPG events and a filter object as arguments and returns a filtered array of EPG events. The filter object can specify a date range, a list of genres, and a list of channels to filter by. The function uses these filter parameters to filter the EPG events accordingly.

```typescript

export function convertFilter(jsonObj: object): EPGDatastoreFilter {
	const filter: EPGDatastoreFilter = jsonObj;
	if (filter.dateRange) {
		filter.dateRange.from = new Date(filter.dateRange.from);
		filter.dateRange.to = new Date(filter.dateRange.to);
	}
	return filter;
}
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="150">

---

&nbsp;

```typescript

// provide item base default filter. usefull for memory DB and caches as well as derrived filter (like in api/event/search)
export function filterEPGs(epgs: ITVHEpgEvent[], filter: EPGDatastoreFilter = {}): ITVHEpgEvent[] {
	let filteredEPGs = epgs;
	if (filter.channel) {
		const clist = filter.channel;
		filteredEPGs = filteredEPGs.filter((epg) => {
			return clist.indexOf(epg.channelUuid) > -1 || clist.indexOf(epg.channelNumber) > -1;
		});
	}
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="160">

---

&nbsp;

```typescript

	if (filter.epgGenre) {
		const glist = filter.epgGenre;
		filteredEPGs = filteredEPGs.filter((epg) => {
			const foundGenres = epg.genre?.find((g) => glist.indexOf(g) > -1) || [];
			return foundGenres.length > 0;
		});
	}
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="168">

---

&nbsp;

```typescript

	if (filter.dateRange) {
		const range = filter.dateRange;
		const fromUnix = new Date(range.from).getTime() / 1000;
		const toUnix = new Date(range.to).getTime() / 1000;
		filteredEPGs = filteredEPGs.filter((epg) => {
			return epg.stop > fromUnix && epg.start <= toUnix;
		});
	}
	return filteredEPGs;
}
```

---

</SwmSnippet>

# Using the filter function

<SwmSnippet path="/src/lib/server/tvh/datastoreMemory.ts" line="236">

---

The filter function is used in various parts of the application to filter EPG events. For example, in the <SwmPath>[src/lib/server/tvh/datastoreMemory.ts](/src/lib/server/tvh/datastoreMemory.ts)</SwmPath> and <SwmPath>[src/lib/server/tvh/datastorePouchdb.ts](/src/lib/server/tvh/datastorePouchdb.ts)</SwmPath> files, the function is used to filter EPG events before they are returned by the <SwmToken path="/src/lib/server/tvh/datastoreMemory.ts" pos="237:5:5" line-data="	public async getFilteredEvents(filter: EPGDatastoreFilter): Promise&lt;ITVHEpgEvent[]&gt; {">`getFilteredEvents`</SwmToken> method.

```typescript

	public async getFilteredEvents(filter: EPGDatastoreFilter): Promise<ITVHEpgEvent[]> {
		const epgs = await this.getSortedEvents();
		return filterEPGs(epgs, filter);
	}

```

---

</SwmSnippet>

# URL filter class

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="179">

---

To handle URL-based filtering, a <SwmToken path="/src/lib/server/tvh/datastoreGlobals.ts" pos="180:4:4" line-data="export class EPGDatastoreUrlFilter implements EPGDatastoreFilter {">`EPGDatastoreUrlFilter`</SwmToken> class was created. This class takes a URL as an argument and extracts filter parameters from the URL's search parameters. These filter parameters are then used to create a filter object that can be passed to the EPG filter function.

```typescript

export class EPGDatastoreUrlFilter implements EPGDatastoreFilter {
	dateRange?: { from: Date; to: Date };
	epgGenre?: string[];
	channel?: string[];

	constructor(url: URL) {
		const params = url.searchParams;
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="187">

---

&nbsp;

```typescript

		if (params.has('channel')) {
			const c = params.getAll('channel');
			this.channel = c;
		}

		if (params.has('genre')) {
			const g = params.getAll('genre');
			this.epgGenre = g;
		}
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastoreGlobals.ts" line="197">

---

&nbsp;

```typescript

		if (params.has('filterFrom') || params.has('filterTo')) {
			if (!this.dateRange) {
				this.dateRange = {
					from: new Date('1.1.1900'),
					to: new Date('1.1.2300')
				};
			}
		}
		if (params.has('filterFrom')) {
			try {
				if (this.dateRange) {
					this.dateRange.from = new Date(<string>params.get('filterFrom'));
				}
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterTo')) {
			try {
				if (this.dateRange) {
					this.dateRange.to = new Date(<string>params.get('filterTo'));
				}
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterAt')) {
			try {
				const d = new Date(<string>params.get('filterAt'));
				// by setting from and to to the same date,
				// only active Events at date will match
				this.dateRange = { from: d, to: d };
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
	}
}
```

---

</SwmSnippet>

# Integration with the database

<SwmSnippet path="/src/lib/server/tvh/datastorePouchdb.ts" line="72">

---

&nbsp;

```typescript

		if (filter.channel) {
			const cids = filter.channel;
			selectors.push({
				$or: [{ 'epg.channelNumber': { $in: cids } }, { 'epg.channelUuid': { $in: cids } }]
			});
			fields.push('epg.channelNumber');
			fields.push('epg.channelUuid');
		}
```

---

</SwmSnippet>

<SwmSnippet path="/src/lib/server/tvh/datastorePouchdb.ts" line="81">

---

&nbsp;

```typescript

		if (filter.epgGenre) {
			selectors.push({ 'epg.genre': { $in: filter.epgGenre } });
			fields.push('epg.genre');
		}

		if (filter.dateRange) {
			const range = filter.dateRange;
			const fromUnix = new Date(range.from).getTime() / 1000;
			const toUnix = new Date(range.to).getTime() / 1000;
```

---

</SwmSnippet>

# Conclusion

The "Standardize EPG Filter" feature provides a standardized way to filter EPG data across the application. By creating a reusable filter function and integrating it with the database, the application can efficiently filter EPG data based on various parameters. This improves the flexibility and performance of the application's EPG data handling capabilities.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBdHZoLWd1aWRlJTNBJTNBY29kaW5nZnJhZ21lbnRz" repo-name="tvh-guide"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
