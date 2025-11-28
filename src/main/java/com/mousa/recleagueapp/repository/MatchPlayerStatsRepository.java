package com.mousa.recleagueapp.repository;

import com.mousa.recleagueapp.model.MatchPlayerStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchPlayerStatsRepository extends JpaRepository<MatchPlayerStats, Long> {
    List<MatchPlayerStats> findbyMatchId(Long matchId);
}
