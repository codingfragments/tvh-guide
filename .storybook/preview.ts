import type { Preview } from '@storybook/svelte';
import '../src/app.css';
import './logger.ts';
import themecfg from '../src/lib/client/themecfg';

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		}
	},
	globalTypes: {
		lightTheme: {
			name: 'Theme',
			description: 'Global theme for components',
			defaultValue: themecfg.defaults.themeLight,
			toolbar: {
				icon: 'eye',
				// Array of plain string values or MenuItem shape (see below)
				items: themecfg.themes.light,
				// Property that specifies if the name of the item will be displayed
				title: true,
				// Change title based on selected value
				dynamicTitle: true
			}
		},
		darkTheme: {
			name: 'Theme',
			description: 'Global theme for components',
			defaultValue: themecfg.defaults.themeDark,
			toolbar: {
				icon: 'eyeclose',
				// Array of plain string values or MenuItem shape (see below)
				items: themecfg.themes.dark,
				// Property that specifies if the name of the item will be displayed
				title: true,
				// Change title based on selected value
				dynamicTitle: true
			}
		},
		darkMode: {
			name: 'ThemeMode',
			description: 'Global theme for components',
			defaultValue: 'light',
			toolbar: {
				icon: 'switchalt',
				// Array of plain string values or MenuItem shape (see below)
				items: ['light', 'dark'],
				// Property that specifies if the name of the item will be displayed
				title: true,
				// Change title based on selected value
				dynamicTitle: true
			}
		}
	}
};

export default preview;
