
import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartingPage from './pages/StartingPage';
import ContestHelperPage from './pages/ContestHelperPage';
import EndPage from './pages/EndPage';

// Data model types
export type MemberId = string;
export type TaskId = string;
export type OperationType = 'Reading' | 'Thinking' | 'Implementing';

export interface AppState {
	contest: {
		name: string;
		durationMs: number;
		startedAt: number;
		endedAt?: number;
		members: { id: MemberId; name: string }[];
		tasks: TaskId[];
	} | null;
	active: Record<MemberId, {
		task: TaskId;
		op: OperationType;
		startedAtOffsetMs: number;
	} | null>;
	records: {
		memberId: MemberId;
		task: TaskId;
		op: OperationType;
		startMs: number;
		endMs: number;
	}[];
}

export const defaultState: AppState = {
	contest: null,
	active: {},
	records: [],
};

export const AppContext = createContext<{
	state: AppState;
	setState: React.Dispatch<React.SetStateAction<AppState>>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AppState>(() => {
		const saved = localStorage.getItem('icpc-logger-state');
		return saved ? JSON.parse(saved) : defaultState;
	});

	useEffect(() => {
		localStorage.setItem('icpc-logger-state', JSON.stringify(state));
	}, [state]);

	return (
		<AppContext.Provider value={{ state, setState }}>
			{children}
		</AppContext.Provider>
	);
}

function App() {
	return (
		<Router>
			<AppProvider>
				<Routes>
					<Route path="/" element={<StartingPage />} />
					<Route path="/contest" element={<ContestHelperPage />} />
					<Route path="/end" element={<EndPage />} />
				</Routes>
			</AppProvider>
		</Router>
	);
}

export default App;
