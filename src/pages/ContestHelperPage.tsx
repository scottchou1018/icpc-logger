
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

function formatTime(ms: number) {
	const s = Math.floor(ms / 1000);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const OPERATIONS = ['Reading', 'Thinking', 'Implementing'] as const;

export default function ContestHelperPage() {
	const { state, setState } = useContext(AppContext)!;
	const navigate = useNavigate();
	const [now, setNow] = useState(Date.now());
	const [opModal, setOpModal] = useState<{ memberId: string; task?: string } | null>(null);
	const [taskPicker, setTaskPicker] = useState<string | null>(null);
	const contest = state.contest!;

	// Timer
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);
	const runUp = now - contest.startedAt;
	const remaining = Math.max(contest.durationMs - runUp, 0);

	// End contest if time runs out
	useEffect(() => {
		if (remaining <= 0 && !contest.endedAt) {
			for(let i: number = 0; i < contest.members.length; i++){
				const memberId = contest.members[i].id;
				const active = state.active[memberId]!;
				setState(s => ({
					...s,
					active: { ...s.active, [memberId]: null },
					records: [
						...s.records,
						{
							memberId,
							task: active.task,
							op: active.op,
							startMs: active.startedAtOffsetMs,
							endMs: runUp,
						},
					],
				}));
			}
			setState(s => ({ ...s, contest: { ...s.contest!, endedAt: now } }));
			navigate('/end');
		}
	}, [remaining, contest.endedAt, setState, navigate, now]);

	function handleEndContest() {
		setState(s => ({ ...s, contest: { ...s.contest!, endedAt: now } }));
		navigate('/end');
	}

	function handleMemberClick(memberId: string) {
		if (state.active[memberId]) {
			// Stop operation
			if (window.confirm('Stop current operation?')) {
				const active = state.active[memberId]!;
				setState(s => ({
					...s,
					active: { ...s.active, [memberId]: null },
					records: [
						...s.records,
						{
							memberId,
							task: active.task,
							op: active.op,
							startMs: active.startedAtOffsetMs,
							endMs: runUp,
						},
					],
				}));
			}
		} else {
			setTaskPicker(memberId);
		}
	}

	function handleTaskPick(task: string) {
		setOpModal({ memberId: taskPicker!, task });
		setTaskPicker(null);
	}

	function handleOpPick(op: string) {
		setState(s => ({
			...s,
			active: {
				...s.active,
				[opModal!.memberId]: {
					task: opModal!.task!,
					op,
					startedAtOffsetMs: runUp,
				},
			},
		}));
		setOpModal(null);
	}

	// UI
	return (
		<div className="contest-helper-page">
			<header>
				<h2>{contest.name}</h2>
				<span>Run-up: {formatTime(runUp)}</span>
				<span>Remaining: {formatTime(remaining)}</span>
				<button onClick={handleEndContest} className="end-contest">End Contest</button>
			</header>
			<main style={{ display: 'flex', gap: 16 }}>
				{contest.members.map(member => {
					const active = state.active[member.id];
					return (
						<button
							key={member.id}
							style={{ flex: 1, minHeight: 120, fontSize: 24, background: active ? '#d32f2f' : '#eee', color: active ? '#fff' : '#222' }}
							aria-label={active ? `Active: ${member.name}` : `Idle: ${member.name}`}
							onClick={() => handleMemberClick(member.id)}
						>
							<div style={{ fontWeight: 'bold' }}>{member.name}</div>
							{active ? (
								<div>
									{active.task} • {active.op} • {formatTime(runUp - active.startedAtOffsetMs)}
								</div>
							) : (
								<div>Idle</div>
							)}
						</button>
					);
				})}
			</main>
			{/* Task Picker Modal */}
			{taskPicker && (
				<div className="modal" role="dialog" aria-modal="true">
					<h3>Pick Task</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{contest.tasks.map(task => (
							<button key={task} onClick={() => handleTaskPick(task)}>{task}</button>
						))}
					</div>
					<button onClick={() => setTaskPicker(null)}>Cancel</button>
				</div>
			)}
			{/* Operation Picker Modal */}
			{opModal && (
				<div className="modal" role="dialog" aria-modal="true">
					<h3>Pick Operation</h3>
					<div style={{ display: 'flex', gap: 8 }}>
						{OPERATIONS.map(op => (
							<button key={op} onClick={() => handleOpPick(op)}>{op}</button>
						))}
					</div>
					<button onClick={() => setOpModal(null)}>Cancel</button>
				</div>
			)}
		</div>
	);
}
