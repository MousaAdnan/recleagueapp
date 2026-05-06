import { useState } from 'react';
import type { Match, Player } from '../types';
import { createStats, updateMatch } from '../api';
import CustomSelect from './CustomSelect';
import PlayerCombobox from './PlayerCombobox';

interface StatRow {
  playerId: number;
  teamName: string;
  runs: string;
  runsConceded: string;
  wickets: string;
  oversBowled: string;
  contributions: string;
}

interface Props {
  match: Match;
  players: Player[];
  onDone: () => void;
  onClose: () => void;
}

type Step = 'stats' | 'result';

export default function InlineMatchEntry({ match, players, onDone, onClose }: Props) {
  const [step,       setStep]       = useState<Step>('stats');
  const [rows,       setRows]       = useState<StatRow[]>([]);
  const [winner,     setWinner]     = useState('');
  const [winMargin,  setWinMargin]  = useState('');
  const [momId,      setMomId]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  function addRow() {
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

  async function submitStats() {
    const valid = rows.filter((r) => r.playerId > 0);
    if (valid.length === 0) { setStep('result'); return; }
    setError(null);
    setSubmitting(true);
    try {
      for (const row of valid) {
        await createStats({
          playerId:      row.playerId,
          matchId:       match.id,
          teamName:      row.teamName,
          runs:          row.runs          ? Number(row.runs)          : null,
          runsConceded:  row.runsConceded  ? Number(row.runsConceded)  : null,
          wickets:       row.wickets       ? Number(row.wickets)       : null,
          oversBowled:   row.oversBowled   ? Number(row.oversBowled)   : null,
          contributions: (row.runs || row.runsConceded)
            ? Number(row.runs || 0) - Number(row.runsConceded || 0)
            : null,
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
    setError(null);
    setSubmitting(true);
    try {
      const updates: Parameters<typeof updateMatch>[1] = {};
      if (winner) updates.result = winMargin ? `${winner} won by ${winMargin} runs` : `${winner} won`;
      if (momId)  updates.momId  = Number(momId);
      if (Object.keys(updates).length > 0) {
        await updateMatch(match.id, updates);
      }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  // Local copy so newly-created players are immediately available in other rows
  const [localPlayers, setLocalPlayers] = useState(players);
  function handleNewPlayer(p: typeof players[0]) {
    setLocalPlayers((prev) => [...prev, p]);
  }

  const playersInMatch = localPlayers.filter((p) => rows.some((r) => r.playerId === p.id));

  return (
    <div style={{ borderTop: '2px solid #FF4E00', background: '#FDFAF4' }}>

      {/* Panel header */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid #E8DFD0', background: 'white' }}
      >
        <div className="flex items-center gap-4">
          <span
            className="font-scoreboard text-[11px] tracking-[0.2em]"
            style={{ color: '#A08060' }}
          >
            Enter Match Data · #{match.id}
          </span>
          {/* Step pills */}
          <div className="flex gap-1">
            {(['stats', 'result'] as Step[]).map((s, i) => (
              <span
                key={s}
                className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5"
                style={{
                  background: step === s ? '#0C2A17' : 'transparent',
                  color:      step === s ? '#C9A84C' : '#C8B090',
                }}
              >
                {i + 1}. {s === 'stats' ? 'Stats' : 'Result'}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-bold transition-colors"
          style={{ color: '#A08060' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1a1208')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A08060')}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {error && (
        <div
          className="mx-6 mt-3 px-3 py-2 text-xs"
          style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Player Stats */}
      {step === 'stats' && (
        <div className="px-6 py-4">
          <p className="text-xs mb-3" style={{ color: '#A08060' }}>
            Add a row for each player. Leave fields blank if not applicable.
          </p>

          {rows.length > 0 && (
            <div className="mb-4 overflow-x-auto" style={{ border: '1px solid #E8DFD0' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#FDFAF4', borderBottom: '1px solid #E8DFD0' }}>
                    {['Player', 'Team', 'Runs', 'RC', 'Wkts', 'Overs', 'Contributions', ''].map((h) => (
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
                          players={localPlayers}
                          value={row.playerId}
                          onChange={(id) => updateRow(i, 'playerId', id)}
                          onNewPlayer={handleNewPlayer}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={row.teamName}
                          onChange={(e) => updateRow(i, 'teamName', e.target.value)}
                          placeholder="Team A"
                          className="w-24 border px-2 py-1 text-sm focus:outline-none"
                          style={{ borderColor: '#E8DFD0' }}
                        />
                      </td>
                      {(['runs', 'runsConceded', 'wickets', 'oversBowled'] as (keyof StatRow)[]).map((f) => (
                        <td key={f} className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step={f === 'oversBowled' ? '0.1' : '1'}
                            value={row[f] as string}
                            onChange={(e) => updateRow(i, f, e.target.value)}
                            className="w-14 border px-2 py-1 text-sm text-right tabular-nums focus:outline-none appearance-none"
                            style={{ borderColor: '#E8DFD0', MozAppearance: 'textfield' } as React.CSSProperties}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <div
                          className="w-14 px-2 py-1 text-sm text-right tabular-nums"
                          style={{ color: (row.runs || row.runsConceded) ? '#1a1208' : '#C8B090', background: '#F5EFE0', border: '1px solid #E8DFD0' }}
                        >
                          {(row.runs || row.runsConceded)
                            ? Number(row.runs || 0) - Number(row.runsConceded || 0)
                            : '—'}
                        </div>
                      </td>
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

          <div className="flex flex-wrap gap-3">
            <button onClick={addRow} className="btn-outline">
              + Add Player
            </button>
            <button onClick={submitStats} disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : rows.filter((r) => r.playerId > 0).length > 0 ? 'Save Stats →' : 'Skip →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Result & MOM */}
      {step === 'result' && (
        <div className="px-6 py-4 space-y-4">
          <p className="text-xs" style={{ color: '#A08060' }}>
            Optionally record the result and Man of the Match.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="field-label">Winner (optional)</label>
                <div className="flex gap-2">
                  {[match.teamA || 'Team A', match.teamB || 'Team B'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setWinner(winner === name ? '' : name)}
                      className="flex-1 px-3 py-2 text-sm font-semibold transition-colors duration-150"
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
              </div>
              {winner && (
                <div>
                  <label className="field-label">Won by (runs, optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={winMargin}
                    onChange={(e) => setWinMargin(e.target.value)}
                    placeholder="e.g. 14"
                    className="field-input"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Man of the Match</label>
              <CustomSelect
                value={momId}
                onChange={(val) => setMomId(String(val))}
                placeholder="None"
                options={[
                  { value: '', label: 'None' },
                  ...playersInMatch.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('stats')} className="btn-outline">
              ← Back
            </button>
            <button onClick={submitResult} disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
