import { For, type Component } from 'solid-js';
import { useAppContext } from '../context/app-context';
import { colors } from '../theme';

export const Messages: Component = () => {
	const appState = useAppContext();

	return (
		<box
			style={{
				flexGrow: 1,
				border: true,
				borderColor: colors.border,
				flexDirection: 'column',
				padding: 1,
				overflow: 'scroll',
				gap: 2
			}}
		>
			<For each={appState.messageHistory}>
				{(m) => {
					const roleColor =
						m.role === 'user' ? colors.accent : m.role === 'system' ? colors.info : colors.success;
					const roleLabel = m.role === 'user' ? 'You ' : m.role === 'system' ? 'SYS ' : 'AI  ';
					return (
						<box style={{ flexDirection: 'column', gap: 1 }}>
							<text fg={roleColor}>{roleLabel}</text>
							<text fg={colors.text} content={`${m.content}`} />
						</box>
					);
				}}
			</For>
		</box>
	);
};
