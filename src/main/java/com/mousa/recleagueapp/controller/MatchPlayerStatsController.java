package com.mousa.recleagueapp.controller;

import com.mousa.recleagueapp.dto.MatchPlayerStatsRequest;
import com.mousa.recleagueapp.model.Match;
import com.mousa.recleagueapp.model.MatchPlayerStats;
import com.mousa.recleagueapp.model.Player;
import com.mousa.recleagueapp.repository.MatchPlayerStatsRepository;
import com.mousa.recleagueapp.repository.MatchRepository;
import com.mousa.recleagueapp.repository.PlayerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class MatchPlayerStatsController {

    private final MatchPlayerStatsRepository matchPlayerStatsRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    public MatchPlayerStatsController(MatchPlayerStatsRepository matchPlayerStatsRepository,
                                      PlayerRepository playerRepository,
                                      MatchRepository matchRepository) {
        this.matchPlayerStatsRepository = matchPlayerStatsRepository;
        this.playerRepository = playerRepository;
        this.matchRepository = matchRepository;
    }

    @GetMapping("/match_player_stats")
    public List<MatchPlayerStats> getAllMatchPlayerStats() {
        return matchPlayerStatsRepository.findAll();
    }

    @PostMapping("/match_player_stats")
    public ResponseEntity<MatchPlayerStats> createStats(@RequestBody MatchPlayerStatsRequest req) {
        Optional<Player> player = playerRepository.findById(req.getPlayerId().intValue());
        Optional<Match> match = matchRepository.findById(req.getMatchId());

        if (player.isEmpty() || match.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        MatchPlayerStats stats = new MatchPlayerStats();
        stats.setPlayer(player.get());
        stats.setMatch(match.get());
        stats.setTeamName(req.getTeamName());
        stats.setRuns(req.getRuns());
        stats.setRunsConceded(req.getRunsConceded());
        stats.setWickets(req.getWickets());
        stats.setOversBowled(req.getOversBowled());
        stats.setContributions(req.getContributions());

        return ResponseEntity.ok(matchPlayerStatsRepository.save(stats));
    }
}
