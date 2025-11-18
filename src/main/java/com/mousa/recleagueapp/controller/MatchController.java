package com.mousa.recleagueapp.controller;

import com.mousa.recleagueapp.model.Match;
import com.mousa.recleagueapp.repository.MatchRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MatchController {
    private final MatchRepository matchRepository;

    public MatchController(MatchRepository matchRepository){
        this.matchRepository = matchRepository;
    }

    @GetMapping("/matches")
    public List<Match> getAllMatches(){
        return matchRepository.findAll();
    }

}
