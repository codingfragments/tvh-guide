import { writable } from 'svelte/store';

type Media<Query extends Record<string, string> = Record<string, string>> = {
	[K in keyof Query]?: boolean | string;
} & {
	classNames: string;
};

type MediaQueryLists = Record<string, MediaQueryList>;

function calculateMedia(mqls: MediaQueryLists) {
	const media: Media = { classNames: '' };
	const mediaClasses = [];
	for (const name in mqls) {
		media[name] = mqls[name].matches;
		if (media[name]) {
			mediaClasses.push(`media-${name}`);
		}
	}
	media.classNames = mediaClasses.join(' ');
	return media;
}

export type MediaResult = Media<Record<string, string>>;

export const watchMedia = function <Query extends Record<string, string>>(mediaqueries: Query) {
	return writable<MediaResult>({ classNames: '' }, (set) => {
		if (typeof window === 'undefined') return;
		const mqls: MediaQueryLists = {};
		const updateMedia = () => set(calculateMedia(mqls));
		for (const key in mediaqueries) {
			const foo = window.matchMedia(mediaqueries[key]);
			mqls[key] = foo;
			foo.addEventListener('change', updateMedia);
		}
		updateMedia();
		return () => {
			for (const key in mqls) {
				mqls[key].removeEventListener('change', updateMedia);
			}
		};
	});
};
