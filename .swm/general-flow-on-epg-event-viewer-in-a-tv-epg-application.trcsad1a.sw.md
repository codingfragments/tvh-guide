---
title: 'general flow on EPG event viewer in a TV EPG Application '
---
# Introduction

This document will walk you through the implementation of the general flow on Electronic Program Guide (EPG) event viewer in a TV EPG Application. The feature allows users to search for events in the EPG and view the results.

We will cover:

1. How the search query is processed and the search results are fetched.


2. How the server handles the GET request and returns the filtered events.


3. How the layout is set up to handle viewport changes and theme settings.

# Processing the search query

<SwmSnippet path="/src/routes/app/epgSearch/+page.ts" line="11">

---

In the file <SwmPath>[src/routes/app/epgSearch/+page.ts](/src/routes/app/epgSearch/+page.ts)</SwmPath>, we have a function that processes the search query and fetches the search results.

```typescript
export const load: PageLoad = async ({ fetch, url, depends }) => {
	depends('app:epgSearch');

	let searchString = '';
	if (!url.searchParams.has('q')) {
		return {
			searchString
		};
	}
	searchString = url.searchParams.get('q') ?? '';
	LOG.debug({ msg: 'EPGSearch', searchString });

	const result = await apiSearchEvents(fetch, url, searchString);
	if (result.status >= 300) {
		error(result.status, result.statusText);
	}
	const resultDTO = await result.json();
	const events: ITVHEpgEvent[] = resultDTO.events;
	const queryStats: ApiResultStats = resultDTO.query;

	return {
		queryStats,
		events: events,
		searchString
	};
};
```

---

</SwmSnippet>

The function <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="11:4:4" line-data="export const load: PageLoad = async ({ fetch, url, depends }) =&gt; {">`load`</SwmToken> is an asynchronous function that takes an object with <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="11:16:16" line-data="export const load: PageLoad = async ({ fetch, url, depends }) =&gt; {">`fetch`</SwmToken>, <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="11:19:19" line-data="export const load: PageLoad = async ({ fetch, url, depends }) =&gt; {">`url`</SwmToken>, and <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="11:22:22" line-data="export const load: PageLoad = async ({ fetch, url, depends }) =&gt; {">`depends`</SwmToken> properties as an argument. It first checks if the URL has a search parameter 'q'. If it doesn't, it returns an object with an empty <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="14:3:3" line-data="	let searchString = &#39;&#39;;">`searchString`</SwmToken>. If the URL does have a search parameter 'q', it fetches the search results from the API and returns an object with <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="29:3:3" line-data="	const queryStats: ApiResultStats = resultDTO.query;">`queryStats`</SwmToken>, <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="28:3:3" line-data="	const events: ITVHEpgEvent[] = resultDTO.events;">`events`</SwmToken>, and <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="14:3:3" line-data="	let searchString = &#39;&#39;;">`searchString`</SwmToken>. This function is crucial as it is the entry point for the search feature, and it handles the search query and fetches the search results.

# Handling the GET request

<SwmSnippet path="/src/routes/api/v1/epg/events/+server.ts" line="15">

---

In the file <SwmPath>[src/routes/api/v1/epg/events/+server.ts](/src/routes/api/v1/epg/events/+server.ts)</SwmPath>, we have a function that handles the GET request and returns the filtered events.

```typescript
export const GET: RequestHandler = async ({ locals, url }) => {
	const body: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
	} = {};

	body.filter = new EPGDatastoreUrlFilter(url);
	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	const epgs = await locals.db.getFilteredEvents(body.filter);
	range.fillResponseInfo(body, epgs.length);
	body.events = range.filter(epgs);

	return json(body);
};

```

---

</SwmSnippet>

The function <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="20:9:9" line-data="	searchString = url.searchParams.get(&#39;q&#39;) ?? &#39;&#39;;">`get`</SwmToken> is an asynchronous function that takes an object with <SwmToken path="/src/routes/api/v1/epg/events/+server.ts" pos="15:16:16" line-data="export const GET: RequestHandler = async ({ locals, url }) =&gt; {">`locals`</SwmToken> and <SwmToken path="/src/routes/app/epgSearch/+page.ts" pos="11:19:19" line-data="export const load: PageLoad = async ({ fetch, url, depends }) =&gt; {">`url`</SwmToken> properties as an argument. It creates a new <SwmToken path="/src/routes/api/v1/epg/events/+server.ts" pos="22:9:9" line-data="	body.filter = new EPGDatastoreUrlFilter(url);">`EPGDatastoreUrlFilter`</SwmToken> with the URL and gets the filtered events from the database. It then fills the response info and filters the events before returning them in a JSON format. This function is important as it handles the GET request and returns the filtered events based on the search query.

# Setting up the layout

<SwmSnippet path="/src/routes/+layout.svelte" line="1">

---

In the file <SwmPath>[src/routes/+layout.svelte](/src/routes/+layout.svelte)</SwmPath>, we set up the layout to handle viewport changes and theme settings.

```svelte
<script context="module" lang="ts">
</script>

<script lang="ts">
	import '../app.css';
	import '$lib/globals';
	import { uiCfg, uiThemeDark } from '$lib/globals';
	import { setMediaContext, setUIDarkContext } from '$lib/client/state/layoutContext';

	import anylogger from 'anylogger';

	const LOG = anylogger('Main App');

	// Check for Media Changes Management
	// ----------------------------------
	import { media } from '$lib/client/state/global';

	$: LOG.info('Viewport Changes : ' + $media.classNames);
	$: uiThemeDark.set($media.dark == true);

	setMediaContext(media);
	setUIDarkContext(uiThemeDark);

	LOG.debug(' Root Navigation ::');

	import type { LayoutData } from './$types';
	export let data: LayoutData;

	uiCfg.set(data.uiCfg);
</script>

<slot />

```

---

</SwmSnippet>

In this script, we import the necessary modules and set up the layout. We listen for viewport changes and set the theme based on whether the media is dark or not. We also set the media context and the UI dark context. This script is important as it sets up the layout and handles viewport changes and theme settings, providing a responsive and user-friendly interface.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBdHZoLWd1aWRlJTNBJTNBY29kaW5nZnJhZ21lbnRz" repo-name="tvh-guide"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
