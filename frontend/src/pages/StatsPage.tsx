import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PlayerAggregate } from '../types';
import { fetchAllStats } from '../api';
import { aggregateStats } from '../utils';

type AggKey = 'matches' | 'totalRuns' | 'totalWickets' | 'economy'
  | 'totalContributions' | 'runsPerGame' | 'wicketsPerGame' | 'contributionsPerGame';
type SortKey = 'name' | AggKey;

const COLUMNS: { key: AggKey; label: string; title: string }[] = [
  { key: 'matches',              label: 'M',      title: 'Matches played' },
  { key: 'totalRuns',            label: 'Runs',   title: 'Total runs scored' },
  { key: 'runsPerGame',          label: 'Avg',    title: 'Runs per game' },
  { key: 'totalWickets',         label: 'Wkts',   title: 'Total wickets taken' },
  { key: 'wicketsPerGame',       label: 'Wkts/G', title: 'Wickets per game' },
  { key: 'economy',              label: 'Eco',    title: 'Economy (runs conceded per over)' },
  { key: 'totalContributions',   label: 'Cont',   title: 'Total contribution points' },
  { key: 'contributionsPerGame', label: 'Cont/G', title: 'Contributions per game' },
];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg
      className={`w-2.5 h-2.5 inline-block ml-0.5 transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
    >
      {dir === 'asc'
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />}
    </svg>
  );
}

/** Counts from 0 → target over `duration` ms, easing out cubic */
function useCountUp(target: number, enabled: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target === 0) { setValue(target); return; }
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, enabled, duration]);

  return value;
}

interface LeaderCardProps {
  label: string;
  value: string;
  sub: string;
  dark?: boolean;
  animate?: boolean;
  numericTarget?: number;
  icon?: 'bat' | 'ball' | null;
}

function BatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 3 21 L 15 9 Q 18 5, 21 3 Q 22 7, 19 10 L 7 21 Z" fill="currentColor" opacity="0.85"/>
      <circle cx="4.5" cy="19.5" r="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

function BallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.85"/>
      <path d="M 2 12 C 5 8, 19 8, 22 12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <path d="M 2 12 C 5 16, 19 16, 22 12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
    </svg>
  );
}

function LeaderCard({ label, value, sub, dark = false, animate = false, numericTarget, icon }: LeaderCardProps) {
  const counted = useCountUp(numericTarget ?? 0, animate && numericTarget !== undefined);
  const display = (animate && numericTarget !== undefined) ? String(counted) : value;

  return (
    <div
      className="px-5 py-5"
      style={{
        background: dark ? '#0C2A17' : 'white',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon === 'bat' && (
          <span style={{ color: '#C9A84C' }}><BatIcon /></span>
        )}
        {icon === 'ball' && (
          <span style={{ color: '#C0392B' }}><BallIcon /></span>
        )}
        <p
          className="font-scoreboard text-[11px] tracking-[0.25em]"
          style={{ color: dark ? '#4A7A5E' : '#7A6A50' }}
        >
          {label}
        </p>
      </div>
      <p
        className="font-display font-bold text-2xl leading-tight truncate"
        style={{
          color: dark ? (icon === 'bat' ? '#C9A84C' : icon === 'ball' ? '#E87070' : 'white') : '#1a1208',
          animation: animate ? 'countUp 600ms cubic-bezier(0.22,1,0.36,1) both' : 'none',
        }}
      >
        {display}
      </p>
      <p
        className="text-[11px] mt-1"
        style={{ color: dark ? 'rgba(201,168,76,0.55)' : '#A08060' }}
      >
        {sub}
      </p>
    </div>
  );
}

export default function StatsPage() {
  const [aggregates, setAggregates] = useState<PlayerAggregate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [sortKey, setSortKey]       = useState<SortKey>('totalRuns');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    fetchAllStats()
      .then((data) => {
        setAggregates(aggregateStats(data));
        setTimeout(() => setReady(true), 80);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? aggregates.filter((a) => a.player.name.toLowerCase().includes(q))
      : aggregates;

    return [...base].sort((a, b) => {
      const av: number | string = sortKey === 'name' ? a.player.name : (a[sortKey] ?? -Infinity);
      const bv: number | string = sortKey === 'name' ? b.player.name : (b[sortKey] ?? -Infinity);
      if (typeof av === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [aggregates, search, sortKey, sortDir]);

  const topRuns    = aggregates.length ? Math.max(...aggregates.map((a) => a.totalRuns))    : 0;
  const topWickets = aggregates.length ? Math.max(...aggregates.map((a) => a.totalWickets)) : 0;

  return (
    <main className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-14">

      {/* Page header */}
      <div className="flex items-end justify-between border-b-2 border-[#1a1208] pb-3 mb-6">
        <div>
          <p
            className="font-scoreboard text-[10px] tracking-[0.3em] mb-0.5"
            style={{ color: '#C9A84C' }}
          >
            Dads v Lads
          </p>
          <h1 className="font-display font-bold text-[32px] leading-tight text-[#1a1208]">
            Player Stats
          </h1>
        </div>
        <p className="text-[11px] font-medium tracking-wide mb-1" style={{ color: '#A08060' }}>
          Aggregated across all matches
        </p>
      </div>

      {/* ── Leader strip ──────────────────────────────────── */}
      {!loading && aggregates.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 mb-6 animate-pop-in"
          style={{ border: '1px solid #E8DFD0', borderRight: 'none' }}
        >
          {[
            {
              label: 'Players',
              value: String(aggregates.length),
              numericTarget: aggregates.length,
              sub: 'registered',
              dark: false,
              icon: null,
            } as LeaderCardProps,
            {
              label: 'Top Bat',
              value: aggregates.find((a) => a.totalRuns === topRuns)?.player.name ?? '—',
              sub: `${topRuns} runs`,
              dark: true,
              icon: 'bat',
            } as LeaderCardProps,
            {
              label: 'Top Bowl',
              value: aggregates.find((a) => a.totalWickets === topWickets)?.player.name ?? '—',
              sub: `${topWickets} wickets`,
              dark: true,
              icon: 'ball',
            } as LeaderCardProps,
            {
              label: 'Avg Matches',
              numericTarget: Math.round(aggregates.reduce((s, a) => s + a.matches, 0) / (aggregates.length || 1)),
              value: String(Math.round(aggregates.reduce((s, a) => s + a.matches, 0) / (aggregates.length || 1))),
              sub: 'per player',
              dark: false,
              icon: null,
            } as LeaderCardProps,
          ].map((c) => (
            <div
              key={c.label}
              style={{ borderRight: '1px solid #E8DFD0' }}
            >
              <LeaderCard {...c} animate={ready} />
            </div>
          ))}
        </div>
      )}

      {/* ── Search ────────────────────────────────────────── */}
      <div className="relative mb-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#A08060' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search players…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input w-full sm:w-64 pr-10"
          style={{ paddingLeft: '2.25rem' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: '#A08060' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Loading skeleton ──────────────────────────────── */}
      {loading && (
        <div style={{ border: '1px solid #E8DFD0' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: '1px solid #F0E8D8' }}>
              <div className="skeleton h-3 w-4 rounded-sm" />
              <div className="skeleton h-4 flex-1 max-w-32 rounded-sm" />
              <div className="skeleton h-3 w-8 rounded-sm" />
              <div className="skeleton h-3 w-10 rounded-sm" />
              <div className="skeleton h-3 w-8 rounded-sm" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-5 py-4 text-sm mt-4" style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
          Could not load stats — make sure the backend is running on port 8080.
        </div>
      )}

      {/* ── Stats table ───────────────────────────────────── */}
      {!loading && !error && (
        <div style={{ background: 'white', border: '1px solid #E8DFD0', overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #1a1208', background: '#FDFAF4' }}>
                  <th
                    className="w-8 text-center px-4 py-3.5 font-scoreboard text-[14px] tracking-[0.18em]"
                    style={{ color: '#A08060' }}
                  >
                    #
                  </th>
                  <th className="text-left px-4 py-3.5">
                    <button
                      onClick={() => handleSort('name')}
                      className="font-scoreboard text-[14px] tracking-[0.18em] transition-colors"
                      style={{ color: sortKey === 'name' ? '#FF4E00' : '#7A6A50' }}
                    >
                      Player
                      <SortIcon active={sortKey === 'name'} dir={sortKey === 'name' ? sortDir : 'asc'} />
                    </button>
                  </th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-right px-4 py-3.5">
                      <button
                        onClick={() => handleSort(col.key)}
                        title={col.title}
                        className="font-scoreboard text-[14px] tracking-[0.18em] transition-colors"
                        style={{ color: sortKey === col.key ? '#FF4E00' : '#7A6A50' }}
                      >
                        {col.label}
                        <SortIcon active={sortKey === col.key} dir={sortKey === col.key ? sortDir : 'desc'} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: 'none' }}>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-sm" style={{ color: '#A08060' }}>
                      {search ? `No players match "${search}"` : 'No stats recorded yet.'}
                    </td>
                  </tr>
                )}
                {filtered.map((agg, i) => (
                  <tr
                    key={agg.player.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #F0E8D8' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FDFAF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td
                      className="px-4 py-3 text-center font-scoreboard text-base"
                      style={{ color: i < 3 ? '#C9A84C' : '#C8B090' }}
                    >
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/player/${agg.player.id}`}
                        className="font-semibold transition-colors"
                        style={{ color: '#1a1208' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4E00')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1208')}
                      >
                        {agg.player.name}
                      </Link>
                    </td>
                    {COLUMNS.map((col) => {
                      const val = agg[col.key];
                      const isTopRuns    = col.key === 'totalRuns'    && agg.totalRuns    === topRuns    && topRuns    > 0;
                      const isTopWickets = col.key === 'totalWickets' && agg.totalWickets === topWickets && topWickets > 0;
                      const display = val == null || val === -Infinity
                        ? <span style={{ color: '#D0C0A0' }}>—</span>
                        : String(val);
                      return (
                        <td key={col.key} className="px-4 py-3 text-right tabular-nums">
                          <span
                            className={isTopRuns || isTopWickets ? 'font-bold font-scoreboard text-[15px]' : ''}
                            style={{
                              color: isTopRuns ? '#C9A84C' : isTopWickets ? '#C0392B' : '#5a4030',
                            }}
                          >
                            {display}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div
              className="px-5 py-2.5 flex items-center gap-3"
              style={{ borderTop: '1px solid #F0E8D8', background: '#FDFAF4' }}
            >
              <span className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="block w-[4px] h-[4px] rounded-full" style={{ background: '#C9A84C', opacity: 0.35 }} />
                ))}
              </span>
              <p className="text-[10px] font-medium" style={{ color: '#A08060' }}>
                {filtered.length} player{filtered.length !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ''}
                {' · '}Eco = Economy · Cont = Contributions · /G = per game
              </p>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
