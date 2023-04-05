import type { StorybookConfig } from '@storybook/sveltekit';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-svelte-csf'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	},
	async viteFinal(config, { configType }) {
		const finalConfig = mergeConfig(config, {
			// customize the Vite config here
			resolve: {
				alias: {
					$lib: path.resolve(__dirname, '../src/lib'),
					$stories: path.resolve(__dirname, '../src/stories')
				}
			}
		});
		// finalConfig.plugins[0] = sveltePluginsWithoutKit;
		// console.log(finalConfig);
		return finalConfig;
	}
};
export default config;
