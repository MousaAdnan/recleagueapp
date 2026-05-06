package com.mousa.recleagueapp.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_date", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "location", length = 200)
    private String location = "insportz";

    @Column(name = "pitch")
    private Integer pitch;

    @Column (name = "team_a", length = 100)
    private String teamA;

    @Column (name = "team_b", length = 100)
    private String teamB;

    @Column (name = "result", length = 200)
    private String result;

    @Column (name = "man_of_the_match_id")
    private Long momId;

    public Match(){}
    public Match (Long id, LocalDateTime startTime, String location, Integer pitch,
                  Long momId, String result,String teamA, String teamB){
        this.id = id;
        this.startTime = startTime;
        this.location = location;
        this.pitch = pitch;
        this.momId = momId;
        this.result = result;
        this.teamA = teamA;
        this.teamB = teamB;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getPitch() {
        return pitch;
    }
    public void setPitch(Integer pitch) {
        this.pitch = pitch;
    }

    public String getTeamA() {
        return teamA;
    }
    public void setTeamA(String teamA) {
        this.teamA = teamA;
    }

    public String getTeamB() {
        return teamB;
    }
    public void setTeamB(String teamB) {
        this.teamB = teamB;
    }

    public String getResult() {
        return result;
    }
    public void setResult(String result) {
        this.result = result;
    }

    public Long getMomId() {
        return momId;
    }
    public void setMomId(Long momId) {
        this.momId = momId;
    }

}
