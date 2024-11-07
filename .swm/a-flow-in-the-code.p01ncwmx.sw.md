---
title: A flow in the code
---
## Introduction

This doc describes the {{SUBJECT}} flow in our system. We will follow its implementation across the various locations so you can understand how the different parts create the full picture.

## Following the flow

<SwmSnippet path="/src/routes/api/v1/epg/events/search/+server.ts" line="13">

---

This code snippet is a `GET` request handler that accepts a `locals` object and a `url` object. It initializes a `body` object with properties for `query`, `events`, `filter`, and `searchString`. It retrieves the value of the `q` parameter from the `url` object. It creates a `SearchRange` object and fills it with information from the `url`. It sets the `filter` property of the `body` object to a new `EPGDatastoreUrlFilter` object. If a `query` exists, it sets the `searchString` property of the `body` object to the `query` value. It performs a search using the `locals.db` object and filters the results using the `filterEPGs` function. It fills the response information in the `body` object using the `range` object and filters the `epgs` array using the `range` object. Finally, it returns the `body` object as JSON.

```typescript
export const GET: RequestHandler = async ({ locals, url }) => {
	const body: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
		searchString?: string;
	} = {};

	const query = url.searchParams.get('q');
	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	body.filter = new EPGDatastoreUrlFilter(url);
	if (query) {
		body.searchString = query;
		const results = await locals.db.search(query);
		const epgs = filterEPGs(results, body.filter);
		range.fillResponseInfo(body, epgs.length);
		body.events = range.filter(epgs);
	}
	return json(body);
};
```

---

</SwmSnippet>

\`{{Keep adding snippets from the next steps of the flow}}

## Things to note

{{Who uses this flow and when?}}

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBdHZoLWd1aWRlJTNBJTNBY29kaW5nZnJhZ21lbnRz" repo-name="tvh-guide"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
