package com.mousa.recleagueapp.service;

import com.mousa.recleagueapp.dto.FairTeamResult;
import com.mousa.recleagueapp.model.MatchPlayerStats;
import com.mousa.recleagueapp.model.Player;
import com.mousa.recleagueapp.repository.MatchPlayerStatsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class FairTeamService {
    private final MatchPlayerStatsRepository matchPlayerStatsRepository;

    public FairTeamService(MatchPlayerStatsRepository matchPlayerStatsRepository) {
        this.matchPlayerStatsRepository = matchPlayerStatsRepository;
    }

    public FairTeamResult generateFairTeams(Long matchId) {
        List<MatchPlayerStats> statsForMatch = matchPlayerStatsRepository.findByMatchId(matchId);

        if (statsForMatch == null || statsForMatch.isEmpty()) {
            return new FairTeamResult(List.of(), List.of(), 0, 0);
        }

        List<Player> roster = extractUniquePlayers(statsForMatch);
        if (roster.size() <= 1) {
            return new FairTeamResult(roster, List.of(), sumOverallStrength(roster, Map.of()), 0);
        }

        List<Integer> rosterIds = roster.stream()
                .map(Player::getId)
                .filter(id -> id != null)
                .toList();

        List<MatchPlayerStats> historical = rosterIds.isEmpty()
                ? List.of()
                : matchPlayerStatsRepository.findByPlayerIdIn(rosterIds);

        Map<Integer, PlayerSignals> signalsByPlayerId = computeSignals(historical);
        List<PlayerCandidate> candidates = buildCandidates(roster, signalsByPlayerId);

        // Search two possible size targets for odd roster sizes.
        int n = candidates.size();
        int aSmall = n / 2;
        int aLarge = n - aSmall;

        BestSplit best1 = findBestSplit(candidates, aSmall);
        BestSplit best2 = (aSmall == aLarge) ? best1 : findBestSplit(candidates, aLarge);

        BestSplit best = best1.objective <= best2.objective ? best1 : best2;

        double teamAScore = best.teamAStrength;
        double teamBScore = best.teamBStrength;
        return new FairTeamResult(best.teamA, best.teamB, teamAScore, teamBScore);
    }

    private static List<Player> extractUniquePlayers(List<MatchPlayerStats> statsForMatch) {
        Set<Integer> seen = new HashSet<>();
        List<Player> roster = new ArrayList<>();
        for (MatchPlayerStats s : statsForMatch) {
            if (s == null || s.getPlayer() == null) continue;
            Player p = s.getPlayer();
            Integer id = p.getId();
            if (id == null) continue;
            if (seen.add(id)) {
                roster.add(p);
            }
        }
        return roster;
    }

    private static Map<Integer, PlayerSignals> computeSignals(List<MatchPlayerStats> historical) {
        Map<Integer, Accum> acc = new HashMap<>();
        if (historical != null) {
            for (MatchPlayerStats s : historical) {
                if (s == null || s.getPlayer() == null || s.getPlayer().getId() == null) continue;
                Integer playerId = s.getPlayer().getId();
                Accum a = acc.computeIfAbsent(playerId, k -> new Accum());
                a.games++;
                a.contributions += nz(s.getContributions());
                a.runs += nz(s.getRuns());
                a.wickets += nz(s.getWickets());

                double overs = nz(s.getOversBowled());
                double conceded = nz(s.getRunsConceded());
                if (overs > 0.000001) {
                    a.economySum += conceded / overs;
                    a.economyGames++;
                }
            }
        }

        Map<Integer, PlayerSignals> out = new HashMap<>();
        for (Map.Entry<Integer, Accum> e : acc.entrySet()) {
            Accum a = e.getValue();
            if (a.games <= 0) continue;

            double contribPerGame = a.contributions / (double) a.games;
            double runsPerGame = a.runs / (double) a.games;
            double wicketsPerGame = a.wickets / (double) a.games;
            double economy = (a.economyGames > 0) ? (a.economySum / a.economyGames) : 0.0;

            // Conservative economy weight so bowling score is not dominated by economy noise.
            double economyWeight = 0.15;
            double bowlingStrength = wicketsPerGame - economyWeight * economy;

            out.put(e.getKey(), new PlayerSignals(contribPerGame, runsPerGame, bowlingStrength));
        }
        return out;
    }

    private static List<PlayerCandidate> buildCandidates(List<Player> roster, Map<Integer, PlayerSignals> signalsByPlayerId) {
        List<PlayerCandidate> candidates = new ArrayList<>(roster.size());
        for (Player p : roster) {
            Integer id = p.getId();
            PlayerSignals s = (id == null) ? null : signalsByPlayerId.get(id);

            // Baselines for players with no history: small, non-zero so they don't become extreme outliers.
            double overall = (s != null) ? s.overallStrength : 1.0;
            double batting = (s != null) ? s.battingStrength : 0.5;
            double bowling = (s != null) ? s.bowlingStrength : 0.5;

            candidates.add(new PlayerCandidate(p, overall, batting, bowling));
        }

        candidates.sort(Comparator.comparingDouble((PlayerCandidate c) -> c.overallStrength).reversed());
        return candidates;
    }

    private static BestSplit findBestSplit(List<PlayerCandidate> candidates, int teamASizeTarget) {
        int n = candidates.size();
        int teamBSizeTarget = n - teamASizeTarget;

        // Weights: overall is primary; batting/bowling and mix are secondary.
        Weights w = new Weights(1.0, 0.25, 0.25, 0.20);

        // Remaining sums for pruning.
        double[] remainingOverall = new double[n + 1];
        double[] remainingBat = new double[n + 1];
        double[] remainingBowl = new double[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            PlayerCandidate c = candidates.get(i);
            remainingOverall[i] = remainingOverall[i + 1] + c.overallStrength;
            remainingBat[i] = remainingBat[i + 1] + c.battingStrength;
            remainingBowl[i] = remainingBowl[i + 1] + c.bowlingStrength;
        }

        BestSplit best = new BestSplit();
        best.objective = Double.POSITIVE_INFINITY;

        ArrayList<Player> teamA = new ArrayList<>(teamASizeTarget);
        ArrayList<Player> teamB = new ArrayList<>(teamBSizeTarget);

        dfsAssign(
                candidates,
                0,
                teamASizeTarget,
                teamBSizeTarget,
                0, 0, 0,
                0, 0, 0,
                teamA,
                teamB,
                remainingOverall,
                remainingBat,
                remainingBowl,
                w,
                best
        );

        return best;
    }

    private static void dfsAssign(
            List<PlayerCandidate> candidates,
            int idx,
            int targetA,
            int targetB,
            double sumAO,
            double sumABat,
            double sumABowl,
            double sumBO,
            double sumBBat,
            double sumBBowl,
            ArrayList<Player> teamA,
            ArrayList<Player> teamB,
            double[] remO,
            double[] remBat,
            double[] remBowl,
            Weights w,
            BestSplit best
    ) {
        int n = candidates.size();
        if (idx == n) {
            if (teamA.size() != targetA || teamB.size() != targetB) return;
            double obj = objective(sumAO, sumABat, sumABowl, sumBO, sumBBat, sumBBowl, w);
            if (obj < best.objective) {
                best.objective = obj;
                best.teamA = List.copyOf(teamA);
                best.teamB = List.copyOf(teamB);
                best.teamAStrength = sumAO;
                best.teamBStrength = sumBO;
            }
            return;
        }

        // Size feasibility pruning.
        int remaining = n - idx;
        int needA = targetA - teamA.size();
        int needB = targetB - teamB.size();
        if (needA < 0 || needB < 0) return;
        if (needA > remaining || needB > remaining) return;

        // Lower-bound pruning (coarse but effective): even if we allocate all remaining strength to the weaker side,
        // what's the best possible overall/bat/bowl deltas we can achieve?
        double lb = lowerBoundObjective(sumAO, sumABat, sumABowl, sumBO, sumBBat, sumBBowl,
                remO[idx], remBat[idx], remBowl[idx], w);
        if (lb >= best.objective) return;

        PlayerCandidate c = candidates.get(idx);

        // Try put in A.
        if (teamA.size() < targetA) {
            teamA.add(c.player);
            dfsAssign(
                    candidates,
                    idx + 1,
                    targetA,
                    targetB,
                    sumAO + c.overallStrength,
                    sumABat + c.battingStrength,
                    sumABowl + c.bowlingStrength,
                    sumBO,
                    sumBBat,
                    sumBBowl,
                    teamA,
                    teamB,
                    remO,
                    remBat,
                    remBowl,
                    w,
                    best
            );
            teamA.remove(teamA.size() - 1);
        }

        // Try put in B.
        if (teamB.size() < targetB) {
            teamB.add(c.player);
            dfsAssign(
                    candidates,
                    idx + 1,
                    targetA,
                    targetB,
                    sumAO,
                    sumABat,
                    sumABowl,
                    sumBO + c.overallStrength,
                    sumBBat + c.battingStrength,
                    sumBBowl + c.bowlingStrength,
                    teamA,
                    teamB,
                    remO,
                    remBat,
                    remBowl,
                    w,
                    best
            );
            teamB.remove(teamB.size() - 1);
        }
    }

    private static double objective(
            double sumAO,
            double sumABat,
            double sumABowl,
            double sumBO,
            double sumBBat,
            double sumBBowl,
            Weights w
    ) {
        double dOverall = Math.abs(sumAO - sumBO);
        double dBat = Math.abs(sumABat - sumBBat);
        double dBowl = Math.abs(sumABowl - sumBBowl);
        double mixA = sumABat - sumABowl;
        double mixB = sumBBat - sumBBowl;
        double dMix = Math.abs(mixA - mixB);
        return w.overall * dOverall + w.bat * dBat + w.bowl * dBowl + w.mix * dMix;
    }

    private static double lowerBoundObjective(
            double sumAO,
            double sumABat,
            double sumABowl,
            double sumBO,
            double sumBBat,
            double sumBBowl,
            double remO,
            double remBat,
            double remBowl,
            Weights w
    ) {
        // Best-case: we can assign all remaining signal to whichever side reduces absolute delta the most.
        double bestOverallDelta = bestPossibleAbsDelta(sumAO, sumBO, remO);
        double bestBatDelta = bestPossibleAbsDelta(sumABat, sumBBat, remBat);
        double bestBowlDelta = bestPossibleAbsDelta(sumABowl, sumBBowl, remBowl);

        // Mix delta depends on both bat/bowl; use a conservative bound (cannot be less than 0).
        double mixA = sumABat - sumABowl;
        double mixB = sumBBat - sumBBowl;
        double mixDelta = Math.abs(mixA - mixB);
        double bestMixDelta = Math.max(0.0, mixDelta - (remBat + remBowl));

        return w.overall * bestOverallDelta + w.bat * bestBatDelta + w.bowl * bestBowlDelta + w.mix * bestMixDelta;
    }

    private static double bestPossibleAbsDelta(double a, double b, double remaining) {
        double delta = Math.abs(a - b);
        return Math.max(0.0, delta - remaining);
    }

    private static double nz(Integer v) {
        return v == null ? 0.0 : v;
    }

    private static double nz(Double v) {
        return v == null ? 0.0 : v;
    }

    private static double sumOverallStrength(List<Player> roster, Map<Integer, PlayerSignals> signalsByPlayerId) {
        double sum = 0.0;
        for (Player p : roster) {
            if (p == null || p.getId() == null) continue;
            PlayerSignals s = signalsByPlayerId.get(p.getId());
            sum += (s == null) ? 1.0 : s.overallStrength;
        }
        return sum;
    }

    private record PlayerSignals(double overallStrength, double battingStrength, double bowlingStrength) {}

    private static final class Accum {
        int games = 0;
        double contributions = 0.0;
        double runs = 0.0;
        double wickets = 0.0;
        int economyGames = 0;
        double economySum = 0.0;
    }

    private record PlayerCandidate(Player player, double overallStrength, double battingStrength, double bowlingStrength) {}

    private record Weights(double overall, double bat, double bowl, double mix) {}

    private static final class BestSplit {
        double objective;
        List<Player> teamA = List.of();
        List<Player> teamB = List.of();
        double teamAStrength;
        double teamBStrength;
    }

}
