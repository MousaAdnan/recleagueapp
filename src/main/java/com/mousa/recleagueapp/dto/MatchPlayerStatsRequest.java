package com.mousa.recleagueapp.dto;

public class MatchPlayerStatsRequest {
    private Long playerId;
    private Long matchId;
    private String teamName;
    private Integer runs;
    private Integer runsConceded;
    private Integer wickets;
    private Double oversBowled;
    private Integer contributions;

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Integer getRuns() { return runs; }
    public void setRuns(Integer runs) { this.runs = runs; }

    public Integer getRunsConceded() { return runsConceded; }
    public void setRunsConceded(Integer runsConceded) { this.runsConceded = runsConceded; }

    public Integer getWickets() { return wickets; }
    public void setWickets(Integer wickets) { this.wickets = wickets; }

    public Double getOversBowled() { return oversBowled; }
    public void setOversBowled(Double oversBowled) { this.oversBowled = oversBowled; }

    public Integer getContributions() { return contributions; }
    public void setContributions(Integer contributions) { this.contributions = contributions; }
}
