import type { Match, MatchPlayerStats, Player } from './types';

const BASE = '';

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${BASE}/players`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE}/matches`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function fetchAllStats(): Promise<MatchPlayerStats[]> {
  const res = await fetch(`${BASE}/match_player_stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function createMatch(data: {
  startTime: string;
  location: string;
  pitch: number | null;
  teamA: string | null;
  teamB: string | null;
}): Promise<Match> {
  const res = await fetch(`${BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create match');
  return res.json();
}

export async function updateMatch(id: number, data: Partial<{
  teamA: string;
  teamB: string;
  result: string;
  momId: number;
}>): Promise<Match> {
  const res = await fetch(`${BASE}/matches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update match');
  return res.json();
}

export async function createStats(data: {
  playerId: number;
  matchId: number;
  teamName: string;
  runs: number | null;
  runsConceded: number | null;
  wickets: number | null;
  oversBowled: number | null;
  contributions: number | null;
}): Promise<MatchPlayerStats> {
  const res = await fetch(`${BASE}/match_player_stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save stats');
  return res.json();
}

export async function createPlayer(name: string): Promise<Player> {
  const res = await fetch(`${BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create player');
  return res.json();
}
