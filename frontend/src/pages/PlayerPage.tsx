import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Match, MatchPlayerStats, Player } from '../types';
import { fetchPlayers, fetchAllStats, fetchMatches } from '../api';
import { formatDate, formatOvers, computeEconomy } from '../utils';

function BatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 3 21 L 15 9 Q 18 5, 21 3 Q 22 7, 19 10 L 7 21 Z" fill="currentColor"/>
      <circle cx="4.5" cy="19.5" r="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

function BallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor"/>
      <path d="M 2 12 C 5 8, 19 8, 22 12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <path d="M 2 12 C 5 16, 19 16, 22 12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
    </svg>
  );
}

function StatCard({
  label, value, sub, dark = false, icon,
}: {
  label: string; value: string; sub: string; dark?: boolean; icon?: 'bat' | 'ball';
}) {
  return (
    <div
      className="px-5 py-5"
      style={{
        background: dark ? '#0C2A17' : 'white',
        borderRight: '1px solid #E8DFD0',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon === 'bat'  && <span style={{ color: '#C9A84C'  }}><BatIcon  /></span>}
        {icon === 'ball' && <span style={{ color: '#C0392B' }}><BallIcon /></span>}
        <p
          className="font-scoreboard text-[11px] tracking-[0.25em]"
          style={{ color: dark ? '#4A7A5E' : '#7A6A50' }}
        >
          {label}
        </p>
      </div>
      <p
        className="font-display font-bold text-[28px] leading-none"
        style={{ color: dark ? (icon === 'bat' ? '#C9A84C' : icon === 'ball' ? '#E87070' : 'white') : '#1a1208' }}
      >
        {value}
      </p>
      <p className="text-[11px] mt-1" style={{ color: dark ? 'rgba(201,168,76,0.55)' : '#A08060' }}>
        {sub}
      </p>
    </div>
  );
}

export default function PlayerPage() {
  const { id }    = useParams<{ id: string }>();
  const playerId  = Number(id);

  const [player,  setPlayer]  = useState<Player | null>(null);
  const [stats,   setStats]   = useState<MatchPlayerStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPlayers(), fetchAllStats(), fetchMatches()])
      .then(([players, allStats, allMatches]) => {
        setPlayer(players.find((p) => p.id === playerId) ?? null);
        setStats(allStats.filter((s) => s.player.id === playerId));
        setMatches(allMatches);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) {
    return (
      <main className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero skeleton */}
        <div className="skeleton h-3 w-24 mb-6 rounded-sm" />
        <div className="mb-6 pb-4" style={{ borderBottom: '2px solid #1a1208' }}>
          <div className="skeleton h-3 w-28 mb-3 rounded-sm" />
          <div className="skeleton h-14 w-64 mb-2 rounded-sm" />
          <div className="skeleton h-3.5 w-40 rounded-sm" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 mb-6" style={{ border: '1px solid #E8DFD0' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-5" style={{ borderRight: '1px solid #E8DFD0' }}>
              <div className="skeleton h-2.5 w-16 mb-3 rounded-sm" />
              <div className="skeleton h-8 w-20 mb-2 rounded-sm" />
              <div className="skeleton h-2.5 w-24 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="skeleton h-52 rounded-sm" />
      </main>
    );
  }

  if (error || !player) {
    return (
      <main className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="px-5 py-4 text-sm" style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
          {error ?? 'Player not found.'}
        </div>
      </main>
    );
  }

  const totalMatches  = stats.length;
  const totalRuns     = stats.reduce((s, r) => s + (r.runs ?? 0), 0);
  const totalWickets  = stats.reduce((s, r) => s + (r.wickets ?? 0), 0);
  const totalRC       = stats.reduce((s, r) => s + (r.runsConceded ?? 0), 0);
  const totalOvers    = stats.reduce((s, r) => s + (r.oversBowled ?? 0), 0);
  const economy       = computeEconomy(totalRC, totalOvers);
  const bestRuns      = stats.length ? Math.max(...stats.map((s) => s.runs ?? 0))    : 0;
  const bestWickets   = stats.length ? Math.max(...stats.map((s) => s.wickets ?? 0)) : 0;

  const history = [...stats].sort(
    (a, b) => new Date(b.match.startTime).getTime() - new Date(a.match.startTime).getTime(),
  );

  const momCount = matches.filter((m) => m.momId === playerId).length;

  return (
    <main className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-14">

      {/* Back */}
      <Link
        to="/stats"
        className="inline-flex items-center gap-1.5 font-scoreboard text-[11px] tracking-[0.2em] uppercase mb-6 transition-colors"
        style={{ color: '#A08060' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4E00')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#A08060')}
      >
        ← Player Stats
      </Link>

      {/* ── Player hero header ────────────────────────── */}
      <div
        className="relative overflow-hidden mb-6"
        style={{
          background: '#0C2A17',
          borderBottom: '2px solid rgba(201,168,76,0.4)',
        }}
      >
        {/* Faint cricket field bg */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 80% 50%, rgba(27,94,59,0.6) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 px-6 sm:px-10 py-8">
          <p
            className="font-scoreboard text-[11px] tracking-[0.3em] mb-2"
            style={{ color: '#4A7A5E' }}
          >
            Player Profile
          </p>
          <h1
            className="font-display font-bold italic leading-none mb-3"
            style={{ fontSize: 'clamp(32px, 6vw, 56px)', color: 'white' }}
          >
            {player.name}
          </h1>
          {momCount > 0 && (
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wide"
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: '#C9A84C',
                }}
              >
                ★ {momCount} Man of the Match{momCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Career stat strip ─────────────────────────── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 mb-8 animate-pop-in"
        style={{ border: '1px solid #E8DFD0', borderRight: 'none' }}
      >
        <StatCard label="Matches"  value={String(totalMatches)}                    sub="played"                  dark={false}  />
        <StatCard label="Runs"     value={String(totalRuns)}                        sub={`best ${bestRuns}`}      dark          icon="bat" />
        <StatCard label="Wickets"  value={String(totalWickets)}                    sub={`best ${bestWickets}`}   dark          icon="ball" />
        <StatCard label="Economy"  value={economy != null ? String(economy) : '—'} sub="runs per over"           dark={false}  />
      </div>

      {/* ── Match history ─────────────────────────────── */}
      <div>
        <div className="section-label mb-0">
          <span className="section-label-text">Match History</span>
          <span className="flex gap-[3px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="block w-[5px] h-[5px] rounded-full" style={{ background: '#C9A84C', opacity: 0.4 }} />
            ))}
          </span>
        </div>

        {history.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: '#A08060' }}>
            No match stats recorded.
          </p>
        )}

        {history.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #E8DFD0', borderTop: 'none', overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0E8D8', background: '#FDFAF4' }}>
                    {['Date', 'Match', 'Team', 'Runs', 'Wkts', 'RC', 'Overs'].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 font-scoreboard text-[11px] tracking-[0.2em] ${h !== 'Date' && h !== 'Match' && h !== 'Team' ? 'text-right' : 'text-left'}`}
                        style={{ color: '#A08060' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => {
                    const isMom = matches.find((m) => m.id === s.match.id)?.momId === playerId;
                    return (
                      <tr
                        key={s.id}
                        style={{ borderBottom: '1px solid #F0E8D8' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FDFAF4')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td className="px-4 py-3 tabular-nums whitespace-nowrap font-scoreboard text-[14px]" style={{ color: '#A08060' }}>
                          {formatDate(s.match.startTime)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/match/${s.match.id}`}
                            className="font-semibold transition-colors"
                            style={{ color: '#1a1208' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4E00')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1208')}
                          >
                            {s.match.teamA && s.match.teamA !== 'TBA'
                              ? `${s.match.teamA} v ${s.match.teamB}`
                              : `Match #${s.match.id}`}
                          </Link>
                          {isMom && (
                            <span
                              className="ml-2 text-[10px] font-bold tracking-wide"
                              style={{ color: '#C9A84C' }}
                            >
                              ★ MOM
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#5a4030' }}>{s.teamName ?? '—'}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: '#1a1208' }}>
                          {s.runs ?? <span style={{ color: '#D0C0A0' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                          {s.wickets ?? <span style={{ color: '#D0C0A0' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                          {s.runsConceded ?? <span style={{ color: '#D0C0A0' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                          {formatOvers(s.oversBowled)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
