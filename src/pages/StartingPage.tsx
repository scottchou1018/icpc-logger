import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

function msToHHMM(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const mm = String(totalMin % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}
function hhmmToMs(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  return (hh * 60 + mm) * 60000;
}

export default function StartingPage() {
  const { state, setState } = useContext(AppContext)!;
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: state.contest?.name || '',
    duration: state.contest?.durationMs ? msToHHMM(state.contest.durationMs) : '05:00',
    members: state.contest?.members.map(m => m.name) || ['', '', ''],
    numTasks: state.contest?.tasks?.length || 5,
  });
  const [errors, setErrors] = React.useState<string[]>([]);

  function validate() {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push('Contest name required');
    if (!/^\d{2}:\d{2}$/.test(form.duration)) errs.push('Duration must be HH:MM');
    const ms = hhmmToMs(form.duration);
    if (ms < 5 * 60000 || ms > 10 * 60 * 60000) errs.push('Duration must be 5 min–10 hr');
    const memberNames = form.members.map(m => m.trim()).filter(m => m);
    if (memberNames.length < 1 || memberNames.length > 3) errs.push('1–3 team members required');
    if (new Set(memberNames).size !== memberNames.length) errs.push('Member names must be unique');
    if (form.numTasks < 1 || form.numTasks > 26) errs.push('Number of tasks must be 1–26');
    return errs;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleMemberChange(idx: number, value: string) {
    setForm(f => {
      const members = [...f.members];
      members[idx] = value;
      return { ...f, members };
    });
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    // Generate contest state
    const memberNames = form.members.map(m => m.trim()).filter(m => m);
    const members = memberNames.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));
    const tasks = Array.from({ length: form.numTasks }, (_, i) => String.fromCharCode(65 + i));
    setState({
      contest: {
        name: form.name.trim(),
        durationMs: hhmmToMs(form.duration),
        startedAt: Date.now(),
        members,
        tasks,
      },
      active: Object.fromEntries(members.map(m => [m.id, null])),
      records: [],
    });
    navigate('/contest');
  }

  return (
    <div className="starting-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f7f7fa' }}>
      <form
        onSubmit={handleSubmit}
        aria-label="Contest Setup"
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem',
          minWidth: 340,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 8, fontSize: '2rem', fontWeight: 700, letterSpacing: 1 }}>🏆 ICPC Training Logger</h1>
        <div>
          <label style={{ fontWeight: 600, fontSize: 16 }}>Contest Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            aria-required="true"
            style={{ width: '100%', fontSize: 18, padding: '0.5em', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
            placeholder="e.g. Weekly Practice #5"
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: 16 }}>Duration <span style={{ fontSize: 13, color: '#888' }}>(HH:MM)</span></label>
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            pattern="\d{2}:\d{2}"
            required
            aria-required="true"
            style={{ width: '100%', fontSize: 18, padding: '0.5em', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
            placeholder="02:30"
          />
          <small style={{ color: '#888' }}>5 min–10 hr</small>
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: 16 }}>Team Members</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.members.map((m, i) => (
              <input
                key={i}
                value={m}
                onChange={e => handleMemberChange(i, e.target.value)}
                required={i === 0}
                aria-required={i === 0}
                placeholder={`Member ${i+1}`}
                style={{ width: '100%', fontSize: 18, padding: '0.5em', borderRadius: 8, border: '1px solid #ccc' }}
              />
            ))}
          </div>
          <small style={{ color: '#888' }}>1–3, unique names</small>
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: 16 }}>Number of Tasks</label>
          <input
            name="numTasks"
            type="number"
            min={1}
            max={26}
            value={form.numTasks}
            onChange={handleChange}
            required
            aria-required="true"
            style={{ width: '100%', fontSize: 18, padding: '0.5em', borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
            placeholder="e.g. 10"
          />
        </div>
        {errors.length > 0 && (
          <div className="errors" aria-live="assertive" style={{ color: '#d32f2f', fontWeight: 500, marginTop: 8 }}>
            {errors.map(e => <div key={e}>{e}</div>)}
          </div>
        )}
        <button
          type="submit"
          className="primary"
          style={{
            background: 'linear-gradient(90deg,#1976d2,#64b5f6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
            border: 'none',
            borderRadius: 8,
            padding: '0.75em 0',
            marginTop: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
            transition: 'background 0.2s',
          }}
        >Start</button>
      </form>
    </div>
  );
}
