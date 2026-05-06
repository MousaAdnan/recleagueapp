import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CricketBatBg from '../components/CricketBatBg';
import type { Match, MatchPlayerStats, Player } from '../types';
import { fetchMatches, fetchAllStats, fetchPlayers } from '../api';
import { formatTime, formatOvers, isUpcoming } from '../utils';

function getWinner(match: Match): string | null {
  if (!match.result) return null;
  const r = match.result.toLowerCase().trim();
  if (match.teamA && r.startsWith(match.teamA.toLowerCase())) return match.teamA;
  if (match.teamB && r.startsWith(match.teamB.toLowerCase())) return match.teamB;
  return null;
}

function StatCell({ value }: { value: number | null | undefined }) {
  if (value == null) return <span style={{ color: '#D0C0A0' }}>—</span>;
  return <span>{value}</span>;
}

function TeamStatsTable({ label, rows }: { label: string; rows: MatchPlayerStats[] }) {
  return (
    <section style={{ background: 'white', border: '1px solid #E8DFD0', overflow: 'hidden' }}>
      {/* Table header bar */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '2px solid #1a1208', background: '#FDFAF4' }}
      >
        <span
          className="block"
          style={{ width: 3, height: 16, background: '#C9A84C', flexShrink: 0 }}
        />
        <h3
          className="font-scoreboard text-[13px] tracking-[0.2em]"
          style={{ color: '#1a1208' }}
        >
          {label}
        </h3>
        {/* Over dots */}
        <span className="flex items-center gap-[3px] ml-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="block w-[4px] h-[4px] rounded-full" style={{ background: '#C9A84C', opacity: 0.3 }} />
          ))}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0E8D8' }}>
              {['Player', 'Runs', 'Wkts', 'RC', 'Overs', 'Pts'].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-2.5 font-scoreboard text-[11px] tracking-[0.2em] ${i === 0 ? 'text-left' : 'text-right'}`}
                  style={{ color: '#A08060' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid #F0E8D8' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FDFAF4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td className="px-5 py-3 font-semibold" style={{ color: '#1a1208' }}>
                  {s.player.name}
                </td>
                <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                  <StatCell value={s.runs} />
                </td>
                <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                  <StatCell value={s.wickets} />
                </td>
                <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                  <StatCell value={s.runsConceded} />
                </td>
                <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                  {formatOvers(s.oversBowled)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#3d2810' }}>
                  <StatCell value={s.contributions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function MatchDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const matchId   = Number(id);

  const [match,   setMatch]   = useState<Match | null>(null);
  const [stats,   setStats]   = useState<MatchPlayerStats[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMatches(), fetchAllStats(), fetchPlayers()])
      .then(([matches, allStats, allPlayers]) => {
        const m = matches.find((m) => m.id === matchId) ?? null;
        setMatch(m);
        setStats(allStats.filter((s) => s.match.id === matchId));
        setPlayers(allPlayers);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [matchId]);

  const mom       = match?.momId ? players.find((p) => p.id === match.momId) : null;
  const teamAStats = stats.filter((s) => s.teamName === match?.teamA);
  const teamBStats = stats.filter((s) => s.teamName === match?.teamB);
  const ungrouped  = stats.filter(
    (s) => s.teamName !== match?.teamA && s.teamName !== match?.teamB,
  );

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="skeleton h-3 w-20 mb-6 rounded-sm" />
        <div
          className="relative overflow-hidden mb-6"
          style={{ background: '#0C2A17', minHeight: 180, borderBottom: '2px solid rgba(201,168,76,0.4)' }}
        >
          <div className="px-10 py-10">
            <div className="skeleton-dark h-2.5 w-28 mb-5 rounded-sm" />
            <div className="skeleton-dark h-10 w-56 mb-3 rounded-sm" />
            <div className="skeleton-dark h-10 w-44 mb-5 rounded-sm" />
            <div className="skeleton-dark h-3.5 w-72 rounded-sm" />
          </div>
        </div>
        <div className="skeleton h-48 rounded-sm" />
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="px-5 py-4 text-sm" style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
          {error ?? 'Match not found.'}
        </div>
      </main>
    );
  }

  const hasTeams      = match.teamA && match.teamB && match.teamA !== 'TBA';
  const matchUpcoming = isUpcoming(match);
  const winner        = getWinner(match);

  return (
    <>
      <CricketBatBg />
    <main className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-14" style={{ position: 'relative', zIndex: 2 }}>

      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-scoreboard text-[11px] tracking-[0.2em] uppercase mb-6 transition-colors"
        style={{ color: '#A08060' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4E00')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#A08060')}
      >
        ← All Matches
      </Link>

      {/* ── Match hero ───────────────────────────────── */}
      <div
        className="relative overflow-hidden mb-6 animate-pop-in"
        style={{ borderBottom: '2px solid rgba(201,168,76,0.5)' }}
      >
        {/* BG */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 110% 70% at 50% 115%, rgba(27,94,59,0.75) 0%, transparent 62%), radial-gradient(ellipse 75% 55% at 50% 50%, #163D25 0%, #0C2A17 75%), #0C2A17',
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2A17]/50 via-transparent to-[#0C2A17]/30 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-stretch">

          {/* Left: teams */}
          <div className="flex flex-col justify-center px-8 sm:px-12 py-8 sm:py-10 flex-1">
            {matchUpcoming ? (
              <>
                <span
                  className="font-scoreboard text-[11px] tracking-[0.3em] block mb-3 flex items-center gap-1.5"
                  style={{ color: '#C9A84C' }}
                >
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#C9A84C', animation: 'pulseGold 2s ease infinite' }} />
                  Upcoming
                </span>
                <span
                  className="font-display font-bold italic text-white leading-tight"
                  style={{ fontSize: 'clamp(28px,5vw,44px)' }}
                >
                  Upcoming Match
                </span>
              </>
            ) : hasTeams ? (
              <>
                <span
                  className="font-scoreboard text-[11px] tracking-[0.3em] block mb-4"
                  style={{ color: '#4A7A5E' }}
                >
                  Match #{match.id}
                </span>
                <p
                  className="font-scoreboard leading-none tracking-wide mb-1"
                  style={{
                    fontSize: 'clamp(28px,5vw,48px)',
                    color: winner === match.teamA ? '#C9A84C' : 'white',
                  }}
                >
                  {match.teamA}
                  {winner === match.teamA && (
                    <span className="ml-3 text-[18px] align-middle">★</span>
                  )}
                </p>
                <p
                  className="font-scoreboard text-xl leading-none mb-1"
                  style={{ color: '#FF4E00' }}
                >
                  VS
                </p>
                <p
                  className="font-scoreboard leading-none tracking-wide"
                  style={{
                    fontSize: 'clamp(28px,5vw,48px)',
                    color: winner === match.teamB ? '#C9A84C' : 'white',
                  }}
                >
                  {match.teamB}
                  {winner === match.teamB && (
                    <span className="ml-3 text-[18px] align-middle">★</span>
                  )}
                </p>
              </>
            ) : (
              <>
                <span
                  className="font-scoreboard text-[11px] tracking-[0.3em] block mb-3"
                  style={{ color: '#4A7A5E' }}
                >
                  Match #{match.id}
                </span>
                <span
                  className="font-display font-bold italic text-white"
                  style={{ fontSize: 'clamp(28px,5vw,44px)' }}
                >
                  No Teams
                </span>
              </>
            )}
          </div>

          {/* Right: meta info */}
          <div
            className="flex flex-col justify-center items-start sm:items-end text-left sm:text-right px-8 sm:px-10 py-6 sm:py-10 shrink-0"
            style={{ borderTop: '1px solid rgba(201,168,76,0.12)', borderLeft: 'none' }}
          >
            <p
              className="font-scoreboard text-lg leading-none tracking-wide mb-2"
              style={{ color: 'rgba(201,168,76,0.7)' }}
            >
              {new Date(match.startTime).toLocaleDateString('en-AU', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <p
              className="font-scoreboard text-lg leading-none tracking-wide mb-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {formatTime(match.startTime)}
            </p>
            {match.location && (
              <p
                className="font-scoreboard text-base leading-none tracking-wide"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {match.location}
                {match.pitch != null && ` · Pitch ${match.pitch}`}
              </p>
            )}

            {(match.result || mom) && (
              <div
                className="flex flex-wrap items-center gap-2 mt-4 pt-4 w-full sm:justify-end"
                style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}
              >
                {match.result && (
                  <span
                    className="text-sm font-semibold"
                    style={{ color: '#6EA804' }}
                  >
                    {match.result}
                  </span>
                )}
                {mom && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wide"
                    style={{
                      background: 'rgba(201,168,76,0.15)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      color: '#C9A84C',
                    }}
                  >
                    ★ MOM — {mom.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────── */}
      {stats.length === 0 ? (
        <div
          className="px-5 py-12 text-center"
          style={{ border: '1px solid #E8DFD0', background: 'white' }}
        >
          <p className="text-sm" style={{ color: '#A08060' }}>
            No player stats recorded for this match.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {[
            { label: match.teamA ?? 'Team A', rows: teamAStats },
            { label: match.teamB ?? 'Team B', rows: teamBStats },
            ...(ungrouped.length > 0 ? [{ label: 'Players', rows: ungrouped }] : []),
          ]
            .filter((g) => g.rows.length > 0)
            .map((group) => (
              <TeamStatsTable key={group.label} label={group.label} rows={group.rows} />
            ))}
        </div>
      )}

    </main>
    </>
  );
}
