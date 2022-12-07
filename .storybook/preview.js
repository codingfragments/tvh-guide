import '../src/app.css';
export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/
		}
	}
};
// .storybook/preview.js
import themecfg from '$lib/client/themecfg';

export const globalTypes = {
	themeLight: {
		name: 'Theme',
		description: 'Global theme for components',
		defaultValue: themecfg.defaults.themeLight,
		toolbar: {
			icon: 'eye',
			// Array of plain string values or MenuItem shape (see below)
			items: themecfg.themes.light,
			// Property that specifies if the name of the item will be displayed
			showName: true,
			// Change title based on selected value
			dynamicTitle: true
		}
	},
	themeDark: {
		name: 'Theme',
		description: 'Global theme for components',
		defaultValue: themecfg.defaults.themeDark,
		toolbar: {
			icon: 'eyeclose',
			// Array of plain string values or MenuItem shape (see below)
			items: themecfg.themes.dark,
			// Property that specifies if the name of the item will be displayed
			showName: true,
			// Change title based on selected value
			dynamicTitle: true
		}
	}
};
