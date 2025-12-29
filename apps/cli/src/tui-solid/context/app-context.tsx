import type { TextareaRenderable } from '@opentui/core';
import {
	createContext,
	createSignal,
	onMount,
	useContext,
	type Accessor,
	type Component,
	type ParentProps
} from 'solid-js';
import type {
	Mode,
	Repo,
	Message,
	InputState,
	ThreadState,
	ThreadQuestion,
	CancelState
} from '../types.ts';
import type { BtcaChunk } from '../../core/index.ts';
import { services } from '../services.ts';
import { generateId } from '../../core/thread/types.ts';

// TODO update the internal naming of "repo" to be "resource"

export type { InputState };

export type WizardStep = 'name' | 'url' | 'branch' | 'notes' | 'confirm';
export type ModelConfigStep = 'provider' | 'model' | 'confirm';

type AppState = {
	// Input state
	inputState: Accessor<InputState>;
	setCursorPosition: (position: number) => void;
	cursorIsCurrentlyIn: Accessor<InputState[number]['type']>;
	setInputState: (state: InputState) => void;
	inputRef: Accessor<TextareaRenderable | null>;
	setInputRef: (ref: TextareaRenderable | null) => void;

	// Model config
	selectedModel: Accessor<string>;
	selectedProvider: Accessor<string>;
	setModel: (model: string) => void;
	setProvider: (provider: string) => void;

	// Messages
	messageHistory: Accessor<Message[]>;
	addMessage: (message: Message) => void;
	updateLastAssistantMessage: (content: string) => void;
	addChunkToLastAssistant: (chunk: BtcaChunk) => void;
	updateChunkInLastAssistant: (id: string, updates: Partial<BtcaChunk>) => void;
	clearMessages: () => void;

	// Repos
	repos: Accessor<Repo[]>;
	setRepos: (repos: Repo[]) => void;
	addRepo: (repo: Repo) => void;
	removeRepo: (name: string) => void;

	// Mode
	mode: Accessor<Mode>;
	setMode: (mode: Mode) => void;

	// Loading state
	isLoading: Accessor<boolean>;
	setIsLoading: (loading: boolean) => void;
	loadingText: Accessor<string>;
	setLoadingText: (text: string) => void;

	// Add repo wizard state
	wizardStep: Accessor<WizardStep>;
	setWizardStep: (step: WizardStep) => void;
	wizardValues: Accessor<{ name: string; url: string; branch: string; notes: string }>;
	setWizardValues: (values: { name: string; url: string; branch: string; notes: string }) => void;
	wizardInput: Accessor<string>;
	setWizardInput: (input: string) => void;

	// Model config wizard state
	modelStep: Accessor<ModelConfigStep>;
	setModelStep: (step: ModelConfigStep) => void;
	modelValues: Accessor<{ provider: string; model: string }>;
	setModelValues: (values: { provider: string; model: string }) => void;

	// Remove repo state
	removeRepoName: Accessor<string>;
	setRemoveRepoName: (name: string) => void;

	// Thread state
	currentThread: Accessor<ThreadState | null>;
	initializeThread: () => Promise<void>;
	addResourcesToThread: (resources: string[]) => void;
	addQuestionToThread: (question: Omit<ThreadQuestion, 'id'>) => Promise<string>;
	updateLastQuestionAnswer: (answer: string) => Promise<void>;
	markLastQuestionCanceled: () => Promise<void>;
	lastQuestionId: Accessor<string | null>;
	setLastQuestionId: (id: string | null) => void;

	// Cancel state
	cancelState: Accessor<CancelState>;
	setCancelState: (state: CancelState) => void;

	// Mark last assistant message as canceled
	markLastAssistantMessageCanceled: () => void;
};

const defaultMessageHistory: Message[] = [
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	}
];

const AppContext = createContext<AppState>();

export const useAppContext = () => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error('useAppContext must be used within an AppProvider');
	}

	return context;
};

export const AppProvider: Component<ParentProps> = (props) => {
	// Model config
	const [selectedModel, setSelectedModel] = createSignal('');
	const [selectedProvider, setSelectedProvider] = createSignal('');

	// Messages
	const [messageHistory, setMessageHistory] = createSignal<Message[]>(defaultMessageHistory);

	// Input state
	const [cursorPosition, setCursorPosition] = createSignal(0);
	const [inputStore, setInputStore] = createSignal<InputState>([]);
	const [inputRef, setInputRef] = createSignal<TextareaRenderable | null>(null);

	// Repos
	const [repos, setReposSignal] = createSignal<Repo[]>([]);

	// Mode
	const [mode, setMode] = createSignal<Mode>('chat');

	// Loading
	const [isLoading, setIsLoading] = createSignal(false);
	const [loadingText, setLoadingText] = createSignal('');

	// Add repo wizard
	const [wizardStep, setWizardStep] = createSignal<WizardStep>('name');
	const [wizardValues, setWizardValues] = createSignal({
		name: '',
		url: '',
		branch: '',
		notes: ''
	});
	const [wizardInput, setWizardInput] = createSignal('');

	// Model config wizard
	const [modelStep, setModelStep] = createSignal<ModelConfigStep>('provider');
	const [modelValues, setModelValues] = createSignal({ provider: '', model: '' });

	// Remove repo
	const [removeRepoName, setRemoveRepoName] = createSignal('');

	// Thread state
	const [currentThread, setCurrentThread] = createSignal<ThreadState | null>(null);
	const [lastQuestionId, setLastQuestionId] = createSignal<string | null>(null);

	// Cancel state
	const [cancelState, setCancelState] = createSignal<CancelState>('none');

	// Load repos and model config on mount
	onMount(() => {
		services.getRepos().then(setReposSignal).catch(console.error);
		services
			.getModel()
			.then((config) => {
				setSelectedProvider(config.provider);
				setSelectedModel(config.model);
			})
			.catch(console.error);
	});

	const state: AppState = {
		// Input
		inputState: inputStore,
		inputRef,
		setInputRef,
		setCursorPosition,
		cursorIsCurrentlyIn: () => {
			const items = inputStore();
			let minIdx = 0;
			for (const item of items) {
				const displayLen =
					item.type === 'pasted' ? `[~${item.lines} lines]`.length : item.content.length;
				const maxIdx = minIdx + displayLen;
				if (cursorPosition() >= minIdx && cursorPosition() <= maxIdx) return item.type;
				minIdx = maxIdx;
			}
			return 'text';
		},
		setInputState: setInputStore,

		// Model
		selectedModel,
		selectedProvider,
		setModel: setSelectedModel,
		setProvider: setSelectedProvider,

		// Messages
		messageHistory,
		addMessage: (message: Message) => {
			setMessageHistory((prev) => [...prev, message]);
		},
		updateLastAssistantMessage: (content: string) => {
			setMessageHistory((prev) => {
				const newHistory = [...prev];
				for (let i = newHistory.length - 1; i >= 0; i--) {
					const msg = newHistory[i];
					if (msg && msg.role === 'assistant') {
						newHistory[i] = { role: 'assistant', content: { type: 'text', content } };
						break;
					}
				}
				return newHistory;
			});
		},
		addChunkToLastAssistant: (chunk: BtcaChunk) => {
			setMessageHistory((prev) => {
				const newHistory = [...prev];
				for (let i = newHistory.length - 1; i >= 0; i--) {
					const msg = newHistory[i];
					if (msg && msg.role === 'assistant' && msg.content.type === 'chunks') {
						newHistory[i] = {
							role: 'assistant',
							content: { type: 'chunks', chunks: [...msg.content.chunks, chunk] }
						};
						break;
					}
				}
				return newHistory;
			});
		},
		updateChunkInLastAssistant: (id: string, updates: Partial<BtcaChunk>) => {
			setMessageHistory((prev) => {
				const newHistory = [...prev];
				for (let i = newHistory.length - 1; i >= 0; i--) {
					const msg = newHistory[i];
					if (msg && msg.role === 'assistant' && msg.content.type === 'chunks') {
						const updatedChunks = msg.content.chunks.map((c): BtcaChunk => {
							if (c.id !== id) return c;
							if (c.type === 'text' && 'text' in updates) {
								return { ...c, text: updates.text as string };
							}
							if (c.type === 'reasoning' && 'text' in updates) {
								return { ...c, text: updates.text as string };
							}
							if (c.type === 'tool' && 'state' in updates) {
								return { ...c, state: updates.state as 'pending' | 'running' | 'completed' };
							}
							return c;
						});
						newHistory[i] = {
							role: 'assistant',
							content: { type: 'chunks', chunks: updatedChunks }
						};
						break;
					}
				}
				return newHistory;
			});
		},
		clearMessages: () => {
			setMessageHistory(defaultMessageHistory);
		},

		// Repos
		repos,
		setRepos: setReposSignal,
		addRepo: (repo: Repo) => {
			setReposSignal((prev) => [...prev, repo]);
		},
		removeRepo: (name: string) => {
			setReposSignal((prev) => prev.filter((r) => r.name !== name));
		},

		// Mode
		mode,
		setMode,

		// Loading
		isLoading,
		setIsLoading,
		loadingText,
		setLoadingText,

		// Add repo wizard
		wizardStep,
		setWizardStep,
		wizardValues,
		setWizardValues,
		wizardInput,
		setWizardInput,

		// Model config wizard
		modelStep,
		setModelStep,
		modelValues,
		setModelValues,

		// Remove repo
		removeRepoName,
		setRemoveRepoName,

		// Thread state
		currentThread,
		lastQuestionId,
		setLastQuestionId,

		initializeThread: async () => {
			if (currentThread()) return; // Already initialized
			const threadId = await services.createThread();
			setCurrentThread({
				id: threadId,
				resources: [],
				questions: []
			});
		},

		addResourcesToThread: (resources: string[]) => {
			const thread = currentThread();
			if (!thread) return;
			const newResources = [...new Set([...thread.resources, ...resources])].sort();
			setCurrentThread({ ...thread, resources: newResources });
		},

		addQuestionToThread: async (question: Omit<ThreadQuestion, 'id'>): Promise<string> => {
			const thread = currentThread();
			if (!thread) throw new Error('No thread initialized');

			const id = generateId();
			const newQuestion: ThreadQuestion = { ...question, id };

			// Update in-memory state
			setCurrentThread({
				...thread,
				questions: [...thread.questions, newQuestion]
			});

			// Persist to database
			const questionId = await services.persistQuestion(thread.id, {
				resources: question.resources,
				prompt: question.prompt,
				answer: question.answer,
				status: question.status
			});

			setLastQuestionId(questionId);
			return questionId;
		},

		updateLastQuestionAnswer: async (answer: string) => {
			const thread = currentThread();
			const qId = lastQuestionId();
			if (!thread || !qId) return;

			// Update in-memory state
			const updatedQuestions = thread.questions.map((q, i) =>
				i === thread.questions.length - 1 ? { ...q, answer } : q
			);
			setCurrentThread({ ...thread, questions: updatedQuestions });

			// Persist to database
			await services.updateQuestionAnswer(qId, answer);
		},

		markLastQuestionCanceled: async () => {
			const thread = currentThread();
			const qId = lastQuestionId();
			if (!thread || !qId) return;

			// Update in-memory state
			const updatedQuestions = thread.questions.map((q, i) =>
				i === thread.questions.length - 1 ? { ...q, status: 'canceled' as const } : q
			);
			setCurrentThread({ ...thread, questions: updatedQuestions });

			// Persist to database
			await services.updateQuestionStatus(qId, 'canceled');
		},

		// Cancel state
		cancelState,
		setCancelState,

		// Mark last assistant message as canceled
		markLastAssistantMessageCanceled: () => {
			setMessageHistory((prev) => {
				const newHistory = [...prev];
				for (let i = newHistory.length - 1; i >= 0; i--) {
					const msg = newHistory[i];
					if (msg && msg.role === 'assistant') {
						newHistory[i] = { ...msg, canceled: true };
						break;
					}
				}
				return newHistory;
			});
		}
	};

	return <AppContext.Provider value={state}>{props.children}</AppContext.Provider>;
};
