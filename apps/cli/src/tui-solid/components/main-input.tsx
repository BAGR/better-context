import type { Component } from 'solid-js';
import { colors } from '../theme';

export const MainInput: Component = () => {
	return (
		<box
			style={{
				border: true,
				borderColor: colors.accent,
				height: 3,
				width: '100%',
				paddingLeft: 1,
				paddingRight: 1
			}}
		>
			<input
				placeholder="@repo question... or / for commands"
				placeholderColor={colors.textSubtle}
				backgroundColor={colors.bg}
				textColor={colors.text}
				style={{
					height: '100%',
					width: '100%'
				}}
			/>
		</box>
	);
};
