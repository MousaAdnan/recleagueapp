export interface Player {
  id: number;
  name: string;
}

export interface Match {
  id: number;
  startTime: string; // ISO datetime
  location: string;
  pitch: number | null;
  teamA: string | null;
  teamB: string | null;
  result: string | null;
  momId: number | null;
}

export interface MatchPlayerStats {
  id: number;
  player: Player;
  match: Match;
  teamName: string | null;
  runs: number | null;
  runsConceded: number | null;
  wickets: number | null;
  oversBowled: number | null;
  contributions: number | null;
}

// Aggregated across all matches for the leaderboard
export interface PlayerAggregate {
  player: Player;
  matches: number;
  totalRuns: number;
  totalWickets: number;
  totalRunsConceded: number;
  totalOversBowled: number;
  totalContributions: number;
  economy: number | null;
  wins: number;
  runsPerGame: number;
  wicketsPerGame: number;
  contributionsPerGame: number;
}
