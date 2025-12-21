import type { Component } from 'solid-js';
import { colors } from '../theme';

export const StatusBar: Component = () => {
	return (
		<box
			style={{
				height: 1,
				width: '100%',
				backgroundColor: colors.bgMuted,
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingLeft: 1,
				paddingRight: 1
			}}
		>
			<text fg={colors.textSubtle} content=" [@repo] Ask question  [/] Commands  [Ctrl+C] Quit" />
			<text fg={colors.textSubtle} content="v0.0.0" />
		</box>
	);
};
