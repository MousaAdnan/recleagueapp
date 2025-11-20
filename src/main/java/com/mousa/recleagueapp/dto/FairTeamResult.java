package com.mousa.recleagueapp.dto;

import com.mousa.recleagueapp.model.Player;

import java.util.List;


public class FairTeamResult {
    private List<Player> teamA;
    private List<Player> teamB;
    private double teamAScore;
    private double teamBScore;

    public FairTeamResult(List<Player> teamA, List<Player> teamB, double teamAScore, double teamBScore) {
        this.teamA = teamA;
        this.teamB = teamB;
        this.teamAScore = teamAScore;
        this.teamBScore = teamBScore;
    }

    public List<Player> getTeamA() {
        return teamA;
    }

    public List<Player> getTeamB() {
        return teamB;
    }

    public double getTeamAScore() {
        return teamAScore;
    }

    public double getTeamBScore() {
        return teamBScore;
    }
}
