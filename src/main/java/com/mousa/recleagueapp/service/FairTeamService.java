package com.mousa.recleagueapp.service;

import com.mousa.recleagueapp.dto.FairTeamResult;
import com.mousa.recleagueapp.model.Match;
import com.mousa.recleagueapp.repository.MatchPlayerStatsRepository;
import com.mousa.recleagueapp.model.MatchPlayerStats;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FairTeamService {
    private final MatchPlayerStatsRepository matchPlayerStatsRepository;

    public FairTeamService(MatchPlayerStatsRepository matchPlayerStatsRepository) {
        this.matchPlayerStatsRepository = matchPlayerStatsRepository;
    }

    public int ContributionsPerGame (){
        return 0;
    }

    public FairTeamResult generateFairTeams(Long matchId) {

        //List<MatchPlayerStats> statsForMatch = matchPlayerStatsRepository.findbyMatchId(matchId);

        //algorithm goes here
        //DFS with backtracking.

        return new FairTeamResult(null, null, 0, 0);
    }


}
