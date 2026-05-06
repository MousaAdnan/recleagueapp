package com.mousa.recleagueapp.controller;

import com.mousa.recleagueapp.model.Player;
import com.mousa.recleagueapp.repository.PlayerRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PlayerController {
    private final PlayerRepository playerRepository;

    public PlayerController(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @GetMapping("/players")
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    @PostMapping("/players")
    public Player createPlayer(@Valid @RequestBody Player player) {
        player.SetId(null); // prevent client-supplied ID overwriting existing records
        return playerRepository.save(player);
    }
}
