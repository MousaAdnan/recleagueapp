import { useEffect, useState } from 'react';
import type { Match, Player } from '../types';
import { fetchMatches, fetchPlayers } from '../api';
import { isUpcoming } from '../utils';
import MatchCard from '../components/MatchCard';
import InlineMatchEntry from '../components/InlineMatchEntry';
import CricketBatBg from '../components/CricketBatBg';

function OverDots({ count = 6 }: { count?: number }) {
  return (
    <span className="flex items-center gap-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="block w-[5px] h-[5px] rounded-full"
          style={{ background: '#C9A84C', opacity: 0.4 }}
        />
      ))}
    </span>
  );
}

export default function MatchesPage() {
  const [matches, setMatches]     = useState<Match[]>([]);
  const [players, setPlayers]     = useState<Player[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [panelMatchId, setPanelMatchId] = useState<number | null>(null);

  function loadMatches() {
    return fetchMatches().then((data) => {
      const sorted = [...data].sort((a, b) => {
        const aUp = isUpcoming(a);
        const bUp = isUpcoming(b);
        if (aUp && !bUp) return -1;
        if (!aUp && bUp) return 1;
        if (aUp && bUp)  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
      setMatches(sorted);
    });
  }

  useEffect(() => {
    Promise.all([loadMatches(), fetchPlayers().then(setPlayers)])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming   = matches.filter(isUpcoming);
  const past       = matches.filter((m) => !isUpcoming(m));
  const panelMatch = panelMatchId != null
    ? matches.find((m) => m.id === panelMatchId) ?? null
    : null;

  function handleDone() {
    setPanelMatchId(null);
    loadMatches().catch(() => {});
  }

  return (
    <>
      <CricketBatBg />
    <main className="page-enter max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 2 }}>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 sm:mx-6 mt-6 px-5 py-4 text-sm"
          style={{ border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}
        >
          Could not load matches — make sure the backend is running on port 8080.
          <br />
          <span style={{ color: '#EF4444', opacity: 0.7 }}>{error}</span>
        </div>
      )}

      {/* ── Upcoming match ─────────────────────────────── */}
      {!loading && upcoming.length > 0 && (
        <section className="mt-0">
          {upcoming.map((m) => (
            <div key={m.id}>
              <MatchCard
                match={m}
                upcoming
                onAddStats={() => setPanelMatchId(panelMatchId === m.id ? null : m.id)}
              />
              {panelMatchId === m.id && panelMatch && (
                <InlineMatchEntry
                  match={panelMatch}
                  players={players}
                  onDone={handleDone}
                  onClose={() => setPanelMatchId(null)}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Upcoming loading skeleton ──────────────────── */}
      {loading && (
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: 220,
            background: '#0C2A17',
            borderBottom: '2px solid rgba(201,168,76,0.4)',
          }}
        >
          <div className="px-10 py-12">
            <div className="skeleton-dark h-2.5 w-28 mb-6 rounded-sm" />
            <div className="skeleton-dark h-12 w-64 mb-3 rounded-sm" />
            <div className="skeleton-dark h-12 w-48 mb-6 rounded-sm" />
            <div className="skeleton-dark h-4 w-72 rounded-sm" />
          </div>
        </div>
      )}

      {/* ── No upcoming ───────────────────────────────── */}
      {!loading && upcoming.length === 0 && !error && (
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            minHeight: 140,
            background: '#0C2A17',
            borderBottom: '2px solid rgba(201,168,76,0.3)',
          }}
        >
          <div className="text-center py-10">
            <p
              className="font-scoreboard text-2xl tracking-[0.25em] mb-1"
              style={{ color: 'rgba(201,168,76,0.4)' }}
            >
              No Upcoming Match
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Head to + Match to schedule the next game
            </p>
          </div>
        </div>
      )}

      {/* ── Past matches section ───────────────────────── */}
      <section className="mt-6 pb-14 px-4 sm:px-6">

        {/* Section header */}
        <div className="section-label mb-0">
          <span className="section-label-text">
            {upcoming.length > 0 ? 'Past Matches' : 'All Matches'}
          </span>
          <OverDots />
        </div>

        {/* Loading rows */}
        {loading && (
          <div className="stagger-children">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-[15px]"
                style={{ borderBottom: '1px solid #E8DFD0' }}
              >
                <div className="skeleton h-3.5 w-28 rounded-sm" />
                <div className="skeleton h-4 flex-1 max-w-52 rounded-sm" />
                <div className="skeleton h-4 w-6 rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {!loading && past.length === 0 && !error && (
          <p
            className="py-12 text-center text-sm"
            style={{ color: '#A08060' }}
          >
            No past matches yet.
          </p>
        )}

        {!loading && (
          <div className="stagger-children">
            {past.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

    </main>
    </>
  );
}
