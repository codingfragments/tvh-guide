/// <reference types="@sveltejs/kit" />
import { version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
console.log('SW : ' + CACHE);

// Mostly empty service-worker for future development
