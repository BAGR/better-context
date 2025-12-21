import type { Component } from 'solid-js';
import { AppProvider } from './context/app-context';
import { render } from '@opentui/solid';
import { MainUi } from '.';

const App: Component = () => {
	return (
		<AppProvider>
			<MainUi />
		</AppProvider>
	);
};

render(() => <App />);
