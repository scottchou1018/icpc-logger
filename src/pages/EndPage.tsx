import React, { useContext } from 'react';
import { AppContext } from '../App';
import Papa from 'papaparse';

function formatHHMM(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDetailedCSV(state) {
  const rows = [
    ['Task', 'Member', 'Operation', 'Start (s)', 'End (s)', 'Duration (s)'],
    ...state.records.map(r => [
      r.task,
      state.contest.members.find(m => m.id === r.memberId)?.name || r.memberId,
      r.op,
      Math.floor(r.startMs / 1000),
      Math.floor(r.endMs / 1000),
      Math.floor((r.endMs - r.startMs) / 1000),
    ])
  ];
  return Papa.unparse(rows);
}

function getPerTaskCSV(state) {
  const members = state.contest.members;
  const rows = [
    ['Task', ...members.map(m => m.name)],
    ...state.contest.tasks.map(task => {
      const cells = members.map(m => {
        const segs = state.records.filter(r => r.task === task && r.memberId === m.id);
        if (!segs.length) return '';
  return segs.map((r: any) => `${r.op}@${formatHHMM(Math.floor(r.startMs / 1000))}-${formatHHMM(Math.floor(r.endMs / 1000))}`).join(' | ');
      });
      return [task, ...cells];
    })
  ];
  return Papa.unparse(rows);
}

export default function EndPage() {
  const { state, setState } = useContext(AppContext)!;
  const contest = state.contest!;
  const elapsed = contest.endedAt! - contest.startedAt;

  function handleExport(type: 'detailed' | 'pertask') {
    const csv = type === 'detailed' ? getDetailedCSV(state) : getPerTaskCSV(state);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contest.name.replace(/\s+/g, '_')}_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    if (window.confirm('Clear all contest data? This cannot be undone.')) {
      setState({ contest: null, active: {}, records: [] });
    }
  }

  return (
    <div className="end-page">
      <h1>Contest Ended</h1>
      <div>
        <strong>{contest.name}</strong><br />
  Duration: {formatHHMM(Math.floor(contest.durationMs / 1000))}<br />
  Actual Elapsed: {formatHHMM(Math.floor(elapsed / 1000))}<br />
        Members: {contest.members.map(m => m.name).join(', ')}<br />
        Tasks: {contest.tasks.length}
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={() => handleExport('detailed')}>Download CSV (Detailed Log)</button>
        <button onClick={() => handleExport('pertask')}>Download CSV (Per-Task, 3 Columns)</button>
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={handleClear}>Clear Data</button>
      </div>
      <div style={{ marginTop: 24, color: '#d32f2f' }}>
        <strong>Safety:</strong> You can’t add more records after ending. Export before leaving.<br />
        Data stays in localStorage until you clear it.
      </div>
    </div>
  );
}
