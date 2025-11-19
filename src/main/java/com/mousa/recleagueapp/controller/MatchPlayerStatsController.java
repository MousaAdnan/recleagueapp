package com.mousa.recleagueapp.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import com.mousa.recleagueapp.model.MatchPlayerStats;
import com.mousa.recleagueapp.repository.MatchPlayerStatsRepository;

import java.util.List;

@RestController
public class MatchPlayerStatsController {

    private final MatchPlayerStatsRepository matchPlayerStatsRepository;

    public MatchPlayerStatsController( MatchPlayerStatsRepository matchPlayerStatsRepository) {
        this.matchPlayerStatsRepository = matchPlayerStatsRepository;
    }

    @GetMapping("/match_player_stats")
    public List<MatchPlayerStats> getAllMatchPlayerStats() {
        return matchPlayerStatsRepository.findAll();
    }
}
