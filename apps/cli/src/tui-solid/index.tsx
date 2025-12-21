import { colors } from './theme.ts';
import { MainInput } from './components/main-input.tsx';
import { StatusBar } from './components/status-bar.tsx';
import { Messages } from './components/messages.tsx';
import type { Component } from 'solid-js';
import { Header } from './components/header.tsx';

export const MainUi: Component = () => {
	return (
		<box
			width="100%"
			height="100%"
			style={{
				flexDirection: 'column',
				backgroundColor: colors.bg
			}}
		>
			<Header />
			<Messages />
			<MainInput />
			<StatusBar />
		</box>
	);
};
