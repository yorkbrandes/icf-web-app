# ICF Web App – Installationsanleitung

Installationszeit: ca. 5 Minuten.

## Voraussetzungen

- Docker & Docker Compose (v2)
- Eine Domain (z.B. `icf.ihre-firma.de`), die auf den Server zeigt
- Offene Ports 80 und 443

## 1. Repository klonen

```bash
git clone https://github.com/yorkbrandes/icf-web-app.git
cd icf-web-app
```

## 2. Konfiguration

```bash
cp .env.example .env
```

`.env` mit einem Texteditor öffnen und alle Werte befüllen:

| Variable | Beschreibung |
|---|---|
| `POSTGRES_USER` | Datenbankbenutzer (frei wählbar) |
| `POSTGRES_PASSWORD` | Datenbankpasswort (sicher wählen) |
| `POSTGRES_DB` | Datenbankname (frei wählbar) |
| `DATABASE_URL` | Wird automatisch aus den Postgres-Werten zusammengesetzt – **nicht ändern** |
| `APP_URL` | Öffentliche URL der App, z.B. `https://icf.ihre-firma.de` |
| `APP_DOMAIN` | Nur die Domain, z.B. `icf.ihre-firma.de` (für Caddy) |
| `JWT_SECRET` | Mindestens 32 zufällige Zeichen: `openssl rand -hex 32` |
| `BOSS_EMAIL` | E-Mail-Adresse des Boss-Accounts |
| `BOSS_PASSWORD` | Sicheres Passwort für den Boss-Account |
| `RETENTION_DAYS` | Datenlöschung nach X Tagen (Standard: 365) |

## 3. App starten

```bash
docker compose up -d --build
```

Beim ersten Start wird automatisch:
- Die Datenbank gestartet und initialisiert
- Der Boss-Account angelegt

## 4. Setup ausführen (Migrationen + Seed)

```bash
docker compose exec app sh setup.sh
```

Dieser Schritt:
- Führt alle Datenbank-Migrationen aus
- Legt die 14 Standard-Hilfsmittel an (idempotent, kann mehrfach ausgeführt werden)

## 5. App öffnen

Die App ist jetzt erreichbar unter der konfigurierten Domain mit automatischem HTTPS (via Caddy).

Boss-Login: `https://ihre-domain.de/de/boss/login`

## Update

```bash
git pull
docker compose up -d --build
docker compose exec app sh setup.sh
```

## Neustart / Status

```bash
docker compose ps          # Status aller Container
docker compose restart app # App neu starten
docker compose logs app    # Logs anzeigen
```

## Backup der Datenbank

```bash
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%F).sql
```

## Daten löschen / Reset

```bash
docker compose down -v     # Alle Container UND Volumes löschen (Daten gehen verloren!)
```
