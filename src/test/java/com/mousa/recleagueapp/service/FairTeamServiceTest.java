package com.mousa.recleagueapp.service;

import com.mousa.recleagueapp.dto.FairTeamResult;
import com.mousa.recleagueapp.model.MatchPlayerStats;
import com.mousa.recleagueapp.model.Player;
import com.mousa.recleagueapp.repository.MatchPlayerStatsRepository;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FairTeamServiceTest {

    @Test
    void generateFairTeams_balancesOverallAndRoleMix() {
        MatchPlayerStatsRepository repo = mock(MatchPlayerStatsRepository.class);
        FairTeamService service = new FairTeamService(repo);

        // 8-player roster for match 100.
        long matchId = 100L;
        List<Player> roster = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            Player p = new Player("P" + i);
            p.SetId(i);
            roster.add(p);
        }

        // Create roster rows (match_player_stats for this match).
        List<MatchPlayerStats> matchRows = new ArrayList<>();
        for (Player p : roster) {
            MatchPlayerStats s = new MatchPlayerStats();
            s.setPlayer(p);
            s.setContributions(0);
            s.setRuns(0);
            s.setWickets(0);
            s.setOversBowled(0.0);
            s.setRunsConceded(0);
            matchRows.add(s);
        }

        when(repo.findByMatchId(matchId)).thenReturn(matchRows);

        // Historical stats: shape two "batters", two "bowlers", four average.
        // Batters: high runs, ok contributions, low bowling.
        // Bowlers: high wickets, decent contributions, worse batting.
        Map<Integer, List<MatchPlayerStats>> hist = new HashMap<>();
        hist.put(1, games(roster.get(0), 6, 45, 0, 0.0, 0));   // Batter
        hist.put(2, games(roster.get(1), 6, 42, 1, 1.0, 6));   // Batter-ish
        hist.put(3, games(roster.get(2), 7, 10, 3, 2.0, 10));  // Bowler
        hist.put(4, games(roster.get(3), 7, 12, 4, 2.0, 12));  // Bowler
        hist.put(5, games(roster.get(4), 5, 18, 1, 1.0, 8));   // Average
        hist.put(6, games(roster.get(5), 5, 16, 1, 1.0, 9));   // Average
        hist.put(7, games(roster.get(6), 5, 15, 1, 1.0, 10));  // Average
        hist.put(8, games(roster.get(7), 5, 17, 1, 1.0, 9));   // Average

        List<MatchPlayerStats> allHistorical = hist.values().stream().flatMap(List::stream).toList();
        when(repo.findByPlayerIdIn(eq(List.of(1, 2, 3, 4, 5, 6, 7, 8)))).thenReturn(allHistorical);
        when(repo.findByPlayerIdIn(anyList())).thenReturn(allHistorical);

        FairTeamResult result = service.generateFairTeams(matchId);

        assertEquals(4, result.getTeamA().size());
        assertEquals(4, result.getTeamB().size());

        // Ensure the two best batters are not on the same team AND two best bowlers not on same team.
        boolean p1InA = containsId(result.getTeamA(), 1);
        boolean p2InA = containsId(result.getTeamA(), 2);
        boolean p3InA = containsId(result.getTeamA(), 3);
        boolean p4InA = containsId(result.getTeamA(), 4);

        assertTrue(p1InA != p2InA, "Top batters should be split across teams");
        assertTrue(p3InA != p4InA, "Top bowlers should be split across teams");

        // Overall score should be reasonably close.
        assertTrue(Math.abs(result.getTeamAScore() - result.getTeamBScore()) <= 2.5);
    }

    private static boolean containsId(List<Player> players, int id) {
        for (Player p : players) {
            if (p != null && p.getId() != null && p.getId() == id) return true;
        }
        return false;
    }

    private static List<MatchPlayerStats> games(Player p, int contributions, int runs, int wickets, double overs, int conceded) {
        // Make 3 identical games so averages are stable.
        return List.of(game(p, contributions, runs, wickets, overs, conceded),
                game(p, contributions, runs, wickets, overs, conceded),
                game(p, contributions, runs, wickets, overs, conceded));
    }

    private static MatchPlayerStats game(Player p, int contributions, int runs, int wickets, double overs, int conceded) {
        MatchPlayerStats s = new MatchPlayerStats();
        s.setPlayer(p);
        s.setContributions(contributions);
        s.setRuns(runs);
        s.setWickets(wickets);
        s.setOversBowled(overs);
        s.setRunsConceded(conceded);
        return s;
    }
}

