package com.mousa.recleagueapp.controller;

import com.mousa.recleagueapp.model.Match;
import com.mousa.recleagueapp.repository.MatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MatchController {
    private final MatchRepository matchRepository;

    public MatchController(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    @GetMapping("/matches")
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @PostMapping("/matches")
    public Match createMatch(@RequestBody Match match) {
        match.setId(null); // prevent client-supplied ID overwriting existing records
        return matchRepository.save(match);
    }

    @PatchMapping("/matches/{id}")
    public ResponseEntity<Match> updateMatch(@PathVariable Long id, @RequestBody Match updates) {
        return matchRepository.findById(id).map(match -> {
            if (updates.getTeamA()   != null) match.setTeamA(updates.getTeamA());
            if (updates.getTeamB()   != null) match.setTeamB(updates.getTeamB());
            if (updates.getResult()  != null) match.setResult(updates.getResult());
            if (updates.getMomId()   != null) match.setMomId(updates.getMomId());
            if (updates.getLocation() != null) match.setLocation(updates.getLocation());
            if (updates.getPitch()   != null) match.setPitch(updates.getPitch());
            if (updates.getStartTime() != null) match.setStartTime(updates.getStartTime());
            return ResponseEntity.ok(matchRepository.save(match));
        }).orElse(ResponseEntity.notFound().build());
    }
}
