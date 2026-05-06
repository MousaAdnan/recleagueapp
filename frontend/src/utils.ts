import type { Match, MatchPlayerStats, PlayerAggregate } from './types';

export function isUpcoming(match: Match): boolean {
  return new Date(match.startTime) > new Date();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatOvers(overs: number | null): string {
  if (overs == null) return '—';
  return overs % 1 === 0 ? `${overs}.0` : `${overs}`;
}

export function computeEconomy(runsConceded: number, oversBowled: number): number | null {
  if (!oversBowled || oversBowled === 0) return null;
  return Math.round((runsConceded / oversBowled) * 10) / 10;
}

export function aggregateStats(allStats: MatchPlayerStats[]): PlayerAggregate[] {
  const map = new Map<number, PlayerAggregate>();

  for (const s of allStats) {
    const pid = s.player.id;
    if (!map.has(pid)) {
      map.set(pid, {
        player: s.player,
        matches: 0,
        totalRuns: 0,
        totalWickets: 0,
        totalRunsConceded: 0,
        totalOversBowled: 0,
        totalContributions: 0,
        economy: null,
        wins: 0,
        runsPerGame: 0,
        wicketsPerGame: 0,
        contributionsPerGame: 0,
      });
    }
    const agg = map.get(pid)!;
    agg.matches += 1;
    agg.totalRuns += s.runs ?? 0;
    agg.totalWickets += s.wickets ?? 0;
    agg.totalRunsConceded += s.runsConceded ?? 0;
    agg.totalOversBowled += s.oversBowled ?? 0;
    agg.totalContributions += s.contributions ?? 0;
  }

  for (const agg of map.values()) {
    agg.economy = computeEconomy(agg.totalRunsConceded, agg.totalOversBowled);
    const m = agg.matches || 1;
    agg.runsPerGame         = Math.round((agg.totalRuns         / m) * 10) / 10;
    agg.wicketsPerGame      = Math.round((agg.totalWickets      / m) * 10) / 10;
    agg.contributionsPerGame = Math.round((agg.totalContributions / m) * 10) / 10;
  }

  return Array.from(map.values());
}
