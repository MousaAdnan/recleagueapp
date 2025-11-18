package com.mousa.recleagueapp.repository;

import com.mousa.recleagueapp.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {
}
