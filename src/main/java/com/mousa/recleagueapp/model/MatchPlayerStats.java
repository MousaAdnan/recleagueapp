package com.mousa.recleagueapp.model;

import jakarta.persistence.*;

@Entity
@Table (name = "match_player_stats")
public class MatchPlayerStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn (name = "player_id")
    private Player player;

    @ManyToOne
    @JoinColumn (name = "match_id")
    private Match match;

    @Column (name = "team_name", length = 100)
    private String teamName;

    @Column (name = "runs")
    private Integer runs;

    @Column (name = "runs_conceded")
    private Integer runsConceded;

    @Column(name = "wickets")
    private Integer wickets;

    @Column (name = "overs_bowled")
    private Double oversBowled;

    @Column (name = "contributions")
    private Integer contributions;

    public MatchPlayerStats() {}
    public MatchPlayerStats(Long id, Player player, Match match, String teamName, Integer runs,
                            Integer runsConceded, Integer wickets, Double oversBowled,
                            Integer contributions){
        this.id = id;
        this.player = player;
        this.match = match;
        this.teamName = teamName;
        this.runs = runs;
        this.runsConceded = runsConceded;
        this.wickets = wickets;
        this.oversBowled = oversBowled;
        this.contributions = contributions;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Player getPlayer() {
        return player;
    }
    public void setPlayer(Player player) {
        this.player = player;
    }

    public Match getMatch() {
        return match;
    }
    public void setMatch(Match match) {
        this.match = match;
    }

    public String getTeamName() {
        return teamName;
    }
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Integer getRuns() {
        return runs;
    }
    public void setRuns(Integer runs) {
        this.runs = runs;
    }

    public Integer getRunsConceded() {
        return runsConceded;
    }
    public void setRunsConceded(Integer runsConceded) {
        this.runsConceded = runsConceded;
    }

    public Integer getWickets() {
        return wickets;
    }
    public void setWickets(Integer wickets) {
        this.wickets = wickets;
    }

    public Double getOversBowled() {
        return oversBowled;
    }
    public void setOversBowled(Double oversBowled) {
        this.oversBowled = oversBowled;
    }

    public Integer getContributions() {
        return contributions;
    }
    public void setContributions(Integer contributions) {
        this.contributions = contributions;
    }
}
