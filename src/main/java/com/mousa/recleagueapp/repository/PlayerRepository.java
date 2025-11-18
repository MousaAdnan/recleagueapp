package com.mousa.recleagueapp.repository;

import com.mousa.recleagueapp.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Integer> {

}
