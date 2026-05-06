gi-- RecLeague seed data — safe to run on existing data
-- Keeps: players 1-4 (Mousa, Adnan, Faris, Hamza), match 1, existing stat row

-- Add more players (names only, IDs auto-assigned)
INSERT INTO players (name) VALUES
  ('Izum'),
  ('Ali Nagi'),
  ('Batman'),
  ('Robin'),
  ('Chotu'),
  ('Shamoon'),
  ('Akbar'),
  ('Umer'),
  ('Zubair'),
  ('Noman'),
  ('Salman'),
  ('Bilal');

-- Add stats for match 1 (Mousas vs Hamzas) for the other players
-- Mousa already has a stat row (id=1), add the rest
INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Mousas', 34, 18, 1, 2.0, 5 FROM players WHERE name = 'Adnan';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Mousas', 22, 24, 0, 2.0, 3 FROM players WHERE name = 'Faris';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Mousas', 10, 30, 0, 2.0, 1 FROM players WHERE name = 'Izum';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Hamzas', 55, 12, 3, 2.0, 8 FROM players WHERE name = 'Hamza';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Hamzas', 28, 20, 1, 2.0, 4 FROM players WHERE name = 'Ali Nagi';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Hamzas', 18, 22, 2, 2.0, 5 FROM players WHERE name = 'Batman';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT id, 1, 'Hamzas', 8,  28, 0, 2.0, 1 FROM players WHERE name = 'Robin';

-- Match 2
INSERT INTO matches (match_date, location, pitch, team_a, team_b, result, man_of_the_match_id)
SELECT '2025-07-06 10:00:00', 'Insportz', 2, 'Adnans', 'Faris FC', 'Adnans won by 8 wickets', id
FROM players WHERE name = 'Adnan';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 48, 10, 3, 2.0, 10
FROM players p, matches m WHERE p.name = 'Adnan' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 30, 14, 1, 2.0, 5
FROM players p, matches m WHERE p.name = 'Mousa' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 18, 22, 0, 2.0, 3
FROM players p, matches m WHERE p.name = 'Chotu' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 12, 18, 1, 2.0, 3
FROM players p, matches m WHERE p.name = 'Shamoon' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 22, 26, 0, 2.0, 2
FROM players p, matches m WHERE p.name = 'Faris' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 35, 20, 2, 2.0, 6
FROM players p, matches m WHERE p.name = 'Hamza' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 14, 24, 1, 2.0, 3
FROM players p, matches m WHERE p.name = 'Akbar' AND m.match_date = '2025-07-06 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 8, 28, 0, 2.0, 1
FROM players p, matches m WHERE p.name = 'Umer' AND m.match_date = '2025-07-06 10:00:00';

-- Match 3
INSERT INTO matches (match_date, location, pitch, team_a, team_b, result, man_of_the_match_id)
SELECT '2025-08-03 10:00:00', 'Insportz', 1, 'Mousas', 'Faris FC', 'Faris FC won by 5 runs', id
FROM players WHERE name = 'Faris';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 60, 16, 2, 2.0, 8
FROM players p, matches m WHERE p.name = 'Mousa' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 22, 20, 1, 2.0, 4
FROM players p, matches m WHERE p.name = 'Adnan' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 16, 28, 0, 2.0, 2
FROM players p, matches m WHERE p.name = 'Izum' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 10, 22, 1, 2.0, 3
FROM players p, matches m WHERE p.name = 'Ali Nagi' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 44, 14, 3, 2.0, 9
FROM players p, matches m WHERE p.name = 'Faris' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 32, 18, 1, 2.0, 5
FROM players p, matches m WHERE p.name = 'Hamza' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 20, 16, 2, 2.0, 6
FROM players p, matches m WHERE p.name = 'Batman' AND m.match_date = '2025-08-03 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Faris FC', 12, 24, 0, 2.0, 2
FROM players p, matches m WHERE p.name = 'Zubair' AND m.match_date = '2025-08-03 10:00:00';

-- Match 4
INSERT INTO matches (match_date, location, pitch, team_a, team_b, result, man_of_the_match_id)
SELECT '2025-09-14 10:00:00', 'Insportz', 2, 'Hamzas', 'Adnans', 'Match tied', id
FROM players WHERE name = 'Batman';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 38, 18, 2, 2.0, 7
FROM players p, matches m WHERE p.name = 'Hamza' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 26, 22, 1, 2.0, 4
FROM players p, matches m WHERE p.name = 'Batman' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 20, 20, 0, 2.0, 3
FROM players p, matches m WHERE p.name = 'Faris' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 14, 16, 2, 2.0, 5
FROM players p, matches m WHERE p.name = 'Noman' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 42, 20, 2, 2.0, 7
FROM players p, matches m WHERE p.name = 'Adnan' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 28, 14, 1, 2.0, 5
FROM players p, matches m WHERE p.name = 'Mousa' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 18, 26, 0, 2.0, 2
FROM players p, matches m WHERE p.name = 'Robin' AND m.match_date = '2025-09-14 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Adnans', 10, 18, 1, 2.0, 3
FROM players p, matches m WHERE p.name = 'Salman' AND m.match_date = '2025-09-14 10:00:00';

-- Match 5
INSERT INTO matches (match_date, location, pitch, team_a, team_b, result, man_of_the_match_id)
SELECT '2025-10-19 10:00:00', 'Insportz', 1, 'Mousas', 'Hamzas', 'Mousas won by 1 wicket', id
FROM players WHERE name = 'Mousa';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 70, 14, 2, 2.0, 10
FROM players p, matches m WHERE p.name = 'Mousa' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 24, 20, 1, 2.0, 4
FROM players p, matches m WHERE p.name = 'Izum' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 16, 22, 1, 2.0, 4
FROM players p, matches m WHERE p.name = 'Chotu' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Mousas', 10, 26, 0, 2.0, 2
FROM players p, matches m WHERE p.name = 'Umer' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 52, 16, 3, 2.0, 8
FROM players p, matches m WHERE p.name = 'Hamza' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 30, 18, 1, 2.0, 4
FROM players p, matches m WHERE p.name = 'Ali Nagi' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 18, 24, 0, 2.0, 3
FROM players p, matches m WHERE p.name = 'Shamoon' AND m.match_date = '2025-10-19 10:00:00';

INSERT INTO match_player_stats (player_id, match_id, team_name, runs, runs_conceded, wickets, overs_bowled, contributions)
SELECT p.id, m.id, 'Hamzas', 12, 20, 1, 2.0, 3
FROM players p, matches m WHERE p.name = 'Akbar' AND m.match_date = '2025-10-19 10:00:00';

-- Upcoming match
INSERT INTO matches (match_date, location, pitch, team_a, team_b, result, man_of_the_match_id)
VALUES ('2026-04-12 10:00:00', 'Insportz', 1, NULL, NULL, NULL, NULL);
