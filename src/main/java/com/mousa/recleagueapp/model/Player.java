package com.mousa.recleagueapp.model;


import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
