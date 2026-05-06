package com.mousa.recleagueapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "players")
public class Player
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Player name must not be blank")
    @Size(max = 100, message = "Player name must be 100 characters or fewer")
    @Column (name = "name", nullable = false, length = 100)
    private String name;

    //Required default constructor by JPA
    public Player(){
    }

    //Optional convenience constructor
    public Player(String name) {
        this.name = name;
    }

    public Integer getId(){
        return id;
    }

    public String getName(){
        return name;
    }

    public void SetId(Integer id){
        this.id = id;
    }

    public void setName(String name){
        this.name = name;
    }

}
