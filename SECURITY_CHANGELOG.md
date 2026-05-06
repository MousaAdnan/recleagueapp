# Security Changelog

A running log of changes made purely for security reasons.

---

## 2026-05-06

### Credential Externalization
- **File:** `src/main/resources/application.properties`
- **Change:** Replaced hardcoded DB password with `${DB_PASSWORD}` environment variable. `DB_URL` and `DB_USERNAME` use env vars with safe local defaults.
- **Risk mitigated:** Plaintext credentials in source files.

### Safe Config Template
- **File:** `src/main/resources/application.properties.example` *(new)*
- **Change:** Added a committed example config with placeholder values so new developers know the required env vars without exposing real credentials.

### Gitignore Hardening
- **File:** `.gitignore`
- **Changes:**
  - Added `.env`, `.env.*` (with `!.env.example` exception) — prevents accidental commit of environment variable files.
  - Added `.claude/` — prevents Claude Code memory/session files (which may contain personal context) from being committed.

### Overposting / Mass Assignment Fix — Players
- **File:** `src/main/java/com/mousa/recleagueapp/controller/PlayerController.java`
- **Change:** Added `player.SetId(null)` before saving on `POST /players`.
- **Risk mitigated:** A client could send `{"id": 3, "name": "x"}` to overwrite an existing player record. JPA treats a non-null ID as an update (merge), not an insert.

### Overposting / Mass Assignment Fix — Matches
- **Files:** `src/main/java/com/mousa/recleagueapp/controller/MatchController.java`, `src/main/java/com/mousa/recleagueapp/model/Match.java`
- **Change:** Changed `Match.id` from primitive `long` to boxed `Long` (required for null assignment), then added `match.setId(null)` before saving on `POST /matches`.
- **Risk mitigated:** Same overposting vulnerability as above — client-supplied IDs on POST could overwrite existing match records.

### Input Validation — Player Name
- **Files:** `src/main/java/com/mousa/recleagueapp/model/Player.java`, `pom.xml`
- **Change:** Added `@NotBlank` and `@Size(max=100)` to `Player.name`; added `@Valid` to the `createPlayer` controller method; added `spring-boot-starter-validation` dependency.
- **Risk mitigated:** Without validation, a null or empty name would reach the DB and throw an unhandled 500. Now returns a proper 400 with a descriptive message.
