import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match, Player } from '../types';
import { fetchPlayers, createMatch, createStats, updateMatch } from '../api';
import CustomSelect from '../components/CustomSelect';
import PlayerCombobox from '../components/PlayerCombobox';

type Step = 'match' | 'stats' | 'result';

interface StatRow {
  playerId: number;
  teamName: string;
  runs: string;
  runsConceded: string;
  wickets: string;
  oversBowled: string;
  contributions: string;
}

const STEPS: { key: Step; label: string; num: string }[] = [
  { key: 'match',  label: 'Match Details', num: '01' },
  { key: 'stats',  label: 'Player Stats',  num: '02' },
  { key: 'result', label: 'Result & MOM',  num: '03' },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState<Step>('match');
  const [players, setPlayers] = useState<Player[]>([]);
  const [createdMatch, setCreatedMatch] = useState<Match | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('10:00');
  const [location, setLocation] = useState('Insportz');
  const [pitch,    setPitch]    = useState('');
  const [teamA,    setTeamA]    = useState('');
  const [teamB,    setTeamB]    = useState('');

  const [rows,      setRows]      = useState<StatRow[]>([]);
  const [winner,    setWinner]    = useState('');
  const [winMargin, setWinMargin] = useState('');
  const [momId,     setMomId]     = useState('');

  useEffect(() => {
    fetchPlayers().then(setPlayers).catch(() => {});
  }, []);

  function addPlayerRow() {
    setRows((r) => [...r, {
      playerId: 0, teamName: '', runs: '', runsConceded: '',
      wickets: '', oversBowled: '', contributions: '',
    }]);
  }

  function updateRow(i: number, field: keyof StatRow, value: string | number) {
    setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function submitMatch() {
    if (!date) { setError('Date is required'); return; }
    setError(null);
    setSubmitting(true);
    try {
      const m = await createMatch({
        startTime: `${date}T${time}:00`,
        location:  location || 'Insportz',
        pitch:     pitch ? Number(pitch) : null,
        teamA:     teamA || null,
        teamB:     teamB || null,
      });
      setCreatedMatch(m);
      setStep('stats');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitStats() {
    if (!createdMatch) return;
    const valid = rows.filter((r) => r.playerId > 0);
    if (valid.length === 0) { setStep('result'); return; }
    setError(null);
    setSubmitting(true);
    try {
      for (const row of valid) {
        await createStats({
          playerId:      row.playerId,
          matchId:       createdMatch.id,
          teamName:      row.teamName,
          runs:          row.runs         ? Number(row.runs)         : null,
          runsConceded:  row.runsConceded ? Number(row.runsConceded) : null,
          wickets:       row.wickets      ? Number(row.wickets)      : null,
          oversBowled:   row.oversBowled  ? Number(row.oversBowled)  : null,
          contributions: row.contributions ? Number(row.contributions) : null,
        });
      }
      setStep('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error saving stats');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResult() {
    if (!createdMatch) return;
    setError(null);
    setSubmitting(true);
    try {
      const updates: Parameters<typeof updateMatch>[1] = {};
      if (winner) updates.result = winMargin ? `${winner} won by ${winMargin} runs` : `${winner} won`;
      if (momId)  updates.momId  = Number(momId);
      if (teamA) updates.teamA = teamA;
      if (teamB) updates.teamB = teamB;
      if (Object.keys(updates).length > 0) {
        await updateMatch(createdMatch.id, updates);
      }
      navigate(`/match/${createdMatch.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  const playersInMatch = players.filter((p) => rows.some((r) => r.playerId === p.id));
  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="page-enter max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">

      {/* Page header */}
      <div className="border-b-2 border-[#1a1208] pb-3 mb-8">
        <p
          className="font-scoreboard text-[11px] tracking-[0.3em] mb-0.5"
          style={{ color: '#C9A84C' }}
        >
          Organiser
        </p>
        <h1 className="font-display font-bold text-[32px] leading-tight text-[#1a1208]">
          Add Match
        </h1>
      </div>

      {/* ── Step indicator ────────────────────────────── */}
      <div className="flex gap-0 mb-8" style={{ border: '1px solid #E8DFD0' }}>
        {STEPS.map((s, i) => {
          const active   = step === s.key;
          const complete = i < currentStepIdx;
          return (
            <div
              key={s.key}
              className="flex-1 px-4 py-3 text-center"
              style={{
                borderRight: i < STEPS.length - 1 ? '1px solid #E8DFD0' : 'none',
                background: active ? '#0C2A17' : complete ? '#F5EFE0' : 'white',
              }}
            >
              <p
                className="font-scoreboard text-[22px] leading-none"
                style={{ color: active ? '#C9A84C' : complete ? '#A08060' : '#D0C0A0' }}
              >
                {s.num}
              </p>
              <p
                className="font-scoreboard text-[10px] tracking-[0.2em] mt-0.5"
                style={{ color: active ? 'rgba(201,168,76,0.6)' : complete ? '#A08060' : '#C8B090' }}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          className="px-4 py-3 text-sm mb-5"
          style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      {/* ── Step 1: Match Details ─────────────────────── */}
      {step === 'match' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field-input" />
            </FieldGroup>
            <FieldGroup label="Time">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Insportz" className="field-input" />
            </FieldGroup>
            <FieldGroup label="Pitch (optional)">
              <input type="number" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="1" className="field-input" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Team A Name (optional)">
              <input value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="Dads" className="field-input" />
            </FieldGroup>
            <FieldGroup label="Team B Name (optional)">
              <input value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="Lads" className="field-input" />
            </FieldGroup>
          </div>
          <div className="pt-2">
            <button onClick={submitMatch} disabled={submitting} className="btn-primary">
              {submitting ? 'Creating…' : 'Create Match →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Player Stats ──────────────────────── */}
      {step === 'stats' && createdMatch && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#7A6A50' }}>
            Match created. Add a row for each player who played — leave fields blank if not applicable.
          </p>

          {rows.length > 0 && (
            <div className="mb-4 overflow-x-auto" style={{ border: '1px solid #E8DFD0' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#FDFAF4', borderBottom: '1px solid #E8DFD0' }}>
                    {['Player', 'Team', 'Runs', 'RC', 'Wkts', 'Overs', 'Pts', ''].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-scoreboard text-[11px] tracking-[0.2em]"
                        style={{ color: '#A08060' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F0E8D8' }}>
                      <td className="px-2 py-2">
                        <PlayerCombobox
                          players={players}
                          value={row.playerId}
                          onChange={(id) => updateRow(i, 'playerId', id)}
                          onNewPlayer={(p) => setPlayers((prev) => [...prev, p])}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={row.teamName}
                          onChange={(e) => updateRow(i, 'teamName', e.target.value)}
                          placeholder="Team A"
                          className="w-24 border px-2 py-1 text-sm focus:outline-none focus:border-[#FF4E00]"
                          style={{ borderColor: '#E8DFD0' }}
                        />
                      </td>
                      {(['runs', 'runsConceded', 'wickets', 'oversBowled', 'contributions'] as (keyof StatRow)[]).map((f) => (
                        <td key={f} className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step={f === 'oversBowled' ? '0.1' : '1'}
                            value={row[f] as string}
                            onChange={(e) => updateRow(i, f, e.target.value)}
                            className="w-14 border px-2 py-1 text-sm text-right tabular-nums focus:outline-none focus:border-[#FF4E00] appearance-none"
                            style={{ borderColor: '#E8DFD0', MozAppearance: 'textfield' } as React.CSSProperties}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-[11px] font-bold transition-colors"
                          style={{ color: '#A08060' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#A08060')}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={addPlayerRow} className="btn-outline">
              + Add Player
            </button>
            <button onClick={submitStats} disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : rows.filter((r) => r.playerId > 0).length > 0 ? 'Save Stats →' : 'Skip →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result & MOM ─────────────────────── */}
      {step === 'result' && createdMatch && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#7A6A50' }}>
            Stats saved. Optionally record the result and Man of the Match.
          </p>
          <FieldGroup label="Winner (optional)">
            <div className="flex gap-2">
              {[teamA || 'Team A', teamB || 'Team B'].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setWinner(winner === name ? '' : name)}
                  className="flex-1 px-4 py-2 text-sm font-semibold transition-colors duration-150"
                  style={{
                    border: '1px solid',
                    borderColor: winner === name ? '#FF4E00' : '#E8DFD0',
                    borderBottom: `2px solid ${winner === name ? '#FF4E00' : '#1a1208'}`,
                    background: winner === name ? 'rgba(255,78,0,0.06)' : 'white',
                    color: winner === name ? '#FF4E00' : '#1a1208',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </FieldGroup>
          {winner && (
            <FieldGroup label="Won by (runs, optional)">
              <input
                type="number"
                min="0"
                value={winMargin}
                onChange={(e) => setWinMargin(e.target.value)}
                placeholder="e.g. 14"
                className="field-input sm:max-w-xs"
              />
            </FieldGroup>
          )}
          <FieldGroup label="Man of the Match">
            <CustomSelect
              value={momId}
              onChange={(val) => setMomId(String(val))}
              placeholder="None"
              options={[
                { value: '', label: 'None' },
                ...playersInMatch.map((p) => ({ value: p.id, label: p.name })),
              ]}
              className="sm:max-w-xs"
            />
          </FieldGroup>
          <div className="pt-2">
            <button onClick={submitResult} disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : 'Done — View Match →'}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
