// STUFF I WANT TO STORE IN HERE
// selected model
// message history for current thread (for now these are just in memory)

import { createContext, createSignal, useContext, type Accessor, type JSX } from 'solid-js';
import { createStore } from 'solid-js/store';

type Message =
	| {
			role: 'user';
			content: string;
	  }
	| {
			role: 'assistant';
			content: string;
	  }
	| {
			role: 'system';
			content: string;
	  };

type AppState = {
	selectedModel: Accessor<string>;
	selectedProvider: Accessor<string>;
	setModel: (model: string) => void;
	setProvider: (provider: string) => void;
	messageHistory: Message[];
	addMessage: (message: Message) => void;
	clearMessages: () => void;
};

const defaultMessageHistory: Message[] = [
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
	},
	{
		role: 'system',
		content:
			"Welcome to btca! Ask anything about the library/framework you're interested in (make sure you @ it first)"
	},
	{
		role: 'assistant',
		content: 'Hello! How can I help you today?'
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

export const AppProvider = (props: { children: JSX.Element }) => {
	// TODO: get these from the actual core process
	const [selectedModel, setSelectedModel] = createSignal('claude-haiku-4-5');
	const [selectedProvider, setSelectedProvider] = createSignal('anthropic');

	const [messageStore, setMessageStore] = createStore<{ messages: Message[] }>({
		messages: defaultMessageHistory
	});

	const state: AppState = {
		selectedModel,
		selectedProvider,
		messageHistory: messageStore.messages,
		setModel: setSelectedModel,
		setProvider: setSelectedProvider,
		addMessage: (message: Message) => {
			setMessageStore('messages', (prev) => [...prev, message]);
		},
		clearMessages: () => {
			setMessageStore('messages', defaultMessageHistory);
		}
	};

	return <AppContext.Provider value={state}>{props.children}</AppContext.Provider>;
};
