import '../src/app.css';

const customViewports = {
	iphoneSE: {
		name: 'iPhoneSE',
		styles: {
			height: '667px',
			width: '375px'
		},
		type: 'mobile'
	},
	iphone: {
		name: 'iPhone',
		styles: {
			height: '844px',
			width: '390px'
		},
		type: 'mobile'
	},
	ipad: {
		name: 'iPad',
		styles: {
			height: '1180px',
			width: '820px'
		},
		type: 'tablet'
	},
	iphoneSE_Hor: {
		name: 'iPhoneSE_Horizontal',
		styles: {
			width: '667px',
			height: '375px'
		},
		type: 'mobile'
	},
	iphone_Hor: {
		name: 'iPhone_Horizontal',
		styles: {
			width: '844px',
			height: '390px'
		},
		type: 'mobile'
	},
	ipad_Hor: {
		name: 'iPad_Horizontal',
		styles: {
			width: '1180px',
			height: '820px'
		},
		type: 'tablet'
	},
	fullhd: {
		name: 'FullHD',
		styles: {
			height: '1080px',
			width: '1920px'
		}
	}
};
export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/
		}
	},
	viewport: { viewports: customViewports }
};
