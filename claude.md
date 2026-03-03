# CLAUDE CODE PROMPT – ICF WEB APP

---

## WICHTIG – GRUNDREGELN

- Dies ist ein **komplett neues Projekt**. Es existiert kein vorheriger Code.
- Alles wird von Grund auf neu aufgebaut.
- KEIN KI-Einsatz (kein GPT, kein LLM, keine API-Calls zu externen Diensten).
- Nur regelbasierte, deterministische Textgenerierung.

---

## WAS IST DIESE APP? (ICF-Kontext)

Diese App ist ein **digitaler Erhebungs- und Dokumentations-Wizard** für die
**Internationale Klassifikation der Funktionsfähigkeit, Behinderung und Gesundheit (ICF)**
der Weltgesundheitsorganisation (WHO).

### Zweck
Ergotherapeuten, Physiotherapeuten oder Sozialarbeiter (= Admins) senden einem
Endnutzer (Patient/Klient) einen Link. Der Endnutzer füllt einen strukturierten
Fragebogen aus. Am Ende wird automatisch ein ICF-konformer Bericht generiert
und vom Admin als PDF/DOCX exportiert.

### ICF-Grundstruktur
Die ICF klassifiziert in 4 Komponenten mit alphanumerischen Codes:

| Komponente | Prefix | Beispiel | Beschreibung |
|---|---|---|---|
| Körperfunktionen | b | b130, b280 | Mentale, sensorische, Schmerz-Funktionen |
| Körperstrukturen | s | s110, s730 | Strukturen des Nervensystems, Extremitäten |
| Aktivitäten & Teilhabe | d | d410, d760 | Mobilität, Selbstversorgung, Beziehungen |
| Umweltfaktoren | e | e110, e310 | Produkte, Unterstützung, Einstellungen |

### ICF-Qualifier (Bewertungsskala)
Jeder ICF-Code erhält einen **Qualifier** (0–4):
- 0 = kein Problem (0–4%)
- 1 = leichtes Problem (5–24%)
- 2 = mäßiges Problem (25–49%)
- 3 = erhebliches Problem (50–95%)
- 4 = vollständiges Problem (96–100%)
- 8 = nicht spezifiziert
- 9 = nicht anwendbar

Im Wizard werden **ausgewählte, praxisrelevante ICF-Codes** abgefragt.
Nicht alle 1.600+ Codes – nur die für den Anwendungsfall relevanten.

### Erhobene ICF-Domänen im Wizard (Auswahl, erweiterbar)

**Körperfunktionen (b):**
- b130 – Energie und Antrieb
- b152 – Emotionale Funktionen
- b280 – Schmerz
- b455 – Belastungstoleranz
- b710 – Gelenkbeweglichkeit
- b730 – Muskelkraft

**Aktivitäten & Teilhabe (d):**
- d410 – Körperlage wechseln
- d415 – In einer Körperlage verbleiben
- d450 – Gehen
- d470 – Transportmittel benutzen
- d510 – Sich waschen
- d530 – Toilette benutzen
- d550 – Essen
- d640 – Hausarbeiten erledigen
- d760 – Familienbeziehungen
- d850 – Bezahlte Tätigkeit

**Umweltfaktoren (e):**
- e110 – Produkte für den persönlichen Gebrauch
- e115 – Hilfsmittel für den persönlichen Gebrauch
- e310 – Engster Familienkreis
- e355 – Fachleute der Gesundheitsberufe
- e580 – Gesundheitsdienste

Jede dieser Fragen wird im Wizard als **Dropdown oder Slider mit Qualifier 0–4**
dargestellt, plus optionalem Freitextfeld für Anmerkungen.

---

## PROJEKT-TECHNOLOGIE

- **Framework:** Next.js 14+ (App Router, Server Actions)
- **Sprache:** TypeScript strict
- **Styling:** Tailwind CSS
- **Datenbank:** PostgreSQL
- **ORM:** Prisma
- **Auth:** bcrypt (12 Runden) + JWT (HttpOnly Cookie, SameSite=Strict, Secure in prod)
- **i18n:** next-intl
- **PDF:** @react-pdf/renderer
- **DOCX:** docx
- **Datei-Storage:** lokaler Upload-Ordner (via ENV konfigurierbar)
- **Cron:** node-cron (Dev), Server-Cron (Prod)

---

## ROLLENSYSTEM (3 Ebenen)

### 1. BOSS (Super-Admin)
- Login: `/boss/login` (E-Mail + Passwort, einmalig aus ENV angelegt)
- **Kann:**
  - Admins anlegen, bearbeiten, deaktivieren, reaktivieren, löschen (nur wenn deaktiviert)
  - Admin-Dashboard read-only öffnen
  - Alle Fälle systemweit einsehen
  - Retention manuell triggern
  - Cleanup-Logs einsehen
  - **Hilfsmittel vollständig über UI verwalten** (anlegen, bearbeiten, deaktivieren, löschen)

### 2. ADMIN (Mandanten-Admin)
- Login: `/admin/login` (Benutzername + Passwort)
- **Kann:**
  - Eigenen Affiliate-Link kopieren
  - Eigene Fälle sehen und filtern
  - Fallstatus ändern (offen / abgeschlossen)
  - **Hilfsmittel pro Fall zuordnen** (aus der aktiven Hilfsmittelliste des Boss)
  - Hilfsmittelauswahl speichern und jederzeit ändern
  - PDF/DOCX exportieren
  - **Niemals** fremde Mandanten-Daten sehen

**Admin-Dashboard – Fallansicht (zusätzlicher Bereich „Hilfsmittel"):**
- Freitexte des Endnutzers aus Step 7 anzeigen (was fehlt / was vorhanden / was gewünscht)
- Checkboxen aller aktiven Hilfsmittel (aus Boss-verwalteter Liste, gruppiert nach Kategorie)
- Admin wählt passende Hilfsmittel aus und speichert
- Optionales Notizfeld pro zugeordnetem Hilfsmittel
- Hilfsmittelauswahl wird in PDF/DOCX-Export übernommen

### 3. ENDNUTZER (kein Login)
- Erreicht App nur via Affiliate-Link `/start?ref=CODE`
- Füllt Wizard aus
- Kein Konto, kein Login, kein Token im Browser

---

## AFFILIATE-SYSTEM

Jeder Admin erhält bei Anlage automatisch einen `referral_code` (8–12 Zeichen, kryptographisch zufällig, nicht erratbar).

**Ablauf:**
1. Admin kopiert seinen Link: `https://app.domain.com/start?ref=ABC123XY`
2. Endnutzer klickt Link
3. Server validiert Code → findet zugehörigen Admin
4. Wizard-Session merkt sich `adminId` serverseitig (Session-Cookie oder DB-Token, KEIN localStorage)
5. Alle erstellten Daten werden automatisch diesem Admin zugeordnet

---

## WIZARD (Schritt-für-Schritt)

Route: `/start?ref=CODE`

### Step 1 – Referral-Validierung
- Code aus URL lesen
- Serverseitig prüfen: existiert Admin, ist aktiv?
- Falls ungültig: Fehlerseite mit Erklärung
- Falls gültig: Weiter zu Step 2

### Step 2 – Rechtstexte & Einwilligung
- Datenschutzerklärung anzeigen (sprachabhängig aus `/content/legal/{lang}/datenschutz.md`)
- Nutzungsbedingungen anzeigen
- Checkbox: „Ich stimme zu" (Pflichtfeld)
- Checkbox: „Ich bin volljährig oder habe Erziehungsberechtigten informiert"

### Step 3 – Anonyme Basisdaten erfassen

Der Endnutzer gibt **keinen Namen** ein. Stattdessen wird automatisch eine
anonyme **Teilnehmer-ID** generiert und angezeigt.

**Automatisch generiert (nicht vom Nutzer eingebbar):**
- Teilnehmer-ID: `TN-XXXXXX` (6-stellig, zufällig, z.B. `TN-847293`)
- Wird dem Nutzer prominent angezeigt mit dem Hinweis:
  „Bitte notieren Sie diese Nummer. Ihr Therapeut kann damit Ihren Fall zuordnen."

**Vom Nutzer einzugeben:**
- Alter (Pflicht) – Zahlenfeld, min 0, max 120
  _(kein Geburtsdatum, nur das Alter – bewusst weniger personenbezogene Daten)_
- Geschlecht (Pflicht) – Dropdown: männlich / weiblich / divers / keine Angabe
- Hauptdiagnose (Freitext, optional) – z.B. „Schlaganfall", „MS"

**Nicht erhoben:**
- Kein Vorname, kein Nachname
- Kein genaues Geburtsdatum
- Keine Adresse, keine Kontaktdaten
- Keine behandelnde Einrichtung (diese kennt der Admin bereits)

**Datenschutz-Hinweis auf dieser Seite:**
„Ihre Angaben werden anonym gespeichert und ausschließlich zur
ICF-Dokumentation verwendet."

**Datenbank-Anpassung:**
Das `Customer`-Model speichert:
- `participantId` (String, eindeutig, z.B. „TN-847293") statt Vor-/Nachname
- `age` (Int) statt Geburtsdatum
- `gender` (String)
- `diagnosis` (String, optional)
- Kein `firstName`, kein `lastName`, kein `birthDate`, kein `institution`

```prisma
model Customer {
  id            String   @id @default(cuid())
  participantId String   @unique  // TN-XXXXXX
  age           Int
  gender        String
  diagnosis     String?
  adminId       String
  admin         Admin    @relation(fields: [adminId], references: [id])
  createdAt     DateTime @default(now())
  cases         Case[]
}
```

### Step 4 – ICF-Fragen (Körperfunktionen & Aktivitäten)
- Alle relevanten ICF-Codes aus obiger Liste (b und d)
- Pro Code: Label mit Erklärung + Qualifier-Auswahl (0–4 + 8 + 9)
- Optionales Notizfeld pro Code
- Gruppiert nach Kategorie (Körperfunktionen / Aktivitäten & Teilhabe)
- Paginiert oder in Akkordeon-Gruppen

### Step 5 – Umweltfaktoren (e-Codes)
- Alle relevanten e-Codes aus obiger Liste
- Gleiche Darstellung wie Step 4
- Zusatzfeld: „Wer unterstützt die Person aktuell?" (Freitext)
- Zusatzfeld: „Wohnsituation" (Dropdown: allein / mit Familie / betreutes Wohnen / Pflegeeinrichtung)

### Step 6 – Ziele
- Bis zu 5 Zielfelder (dynamisch hinzufügbar)
- Pro Ziel: Beschreibung (Pflicht) + Zeithorizont (kurzfristig / mittelfristig / langfristig)
- Mindestens 1 Ziel Pflichtfeld

### Step 7 – Hilfsmittel-Wünsche (Freitext durch Endnutzer)

Der Endnutzer **wählt keine Hilfsmittel aus einer Liste** – das ist Aufgabe des Admins.
Der Endnutzer kann in diesem Schritt nur in eigenen Worten beschreiben, was ihm fehlt oder was er sich wünscht.

Felder:
- „Was fehlt Ihnen im Alltag?" (Freitext, optional)
- „Welche Hilfsmittel nutzen Sie bereits?" (Freitext, optional)
- „Was würde Ihnen helfen?" (Freitext, optional)

Diese Freitexte werden im Case gespeichert und dem Admin im Dashboard angezeigt.
Sie dienen als Grundlage für die Hilfsmittelauswahl durch den Admin.

**Die tatsächliche Hilfsmittelauswahl erfolgt ausschließlich durch den Admin** im Admin-Dashboard
unter „Fall bearbeiten → Hilfsmittel zuordnen" (siehe Admin-Dashboard unten).

### Step 8 – Zusammenfassung
- Teilnehmer-ID, Alter, Geschlecht, Diagnose (kein Name) anzeigen
- Alle ICF-Antworten übersichtlich anzeigen
- Ziele, Umfeld, Hilfsmittel anzeigen
- Zurück-Button zu jedem Step
- Keine Bearbeitung direkt hier (nur via Zurück-Navigation)
- „Jetzt verbindlich absenden"-Button

### Step 9 – Signatur
- Canvas-Element zur handschriftlichen Unterschrift (touch & mouse)
- „Löschen"-Button für Neuzeichnung
- Unterschrift wird als PNG gespeichert: `/uploads/signatures/{case_id}.png`
- Pflichtfeld: Absenden nur mit Signatur möglich

### Step 10 – Abschluss
- Customer-Datensatz anlegen (mit `participantId = TN-XXXXXX`)
- Case anlegen + mit adminId verknüpfen
- Fallnummer generieren: `ICF-YYYY-XXXXXX` (Jahr + 6-stellige Sequenz)
- Textbericht automatisch generieren (regelbasiert, siehe unten)
- Anzeige: „Ihre Teilnehmer-ID: **TN-847293**"
- Anzeige: „Ihre Fallnummer: **ICF-2025-000123**"
- Anzeige: „Bitte notieren Sie diese Nummern. Ihr Therapeut kann damit Ihre Unterlagen zuordnen."
- Anzeige: „Vielen Dank. Ihr Ansprechpartner wird sich melden."
- Kein PDF-Download für Endnutzer

---

## DATENBANK-SCHEMA (Prisma)

```prisma
model Boss {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Admin {
  id           String    @id @default(cuid())
  username     String    @unique
  password     String
  referralCode String    @unique
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  cases        Case[]
  customers    Customer[]
}

model Customer {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  birthDate   DateTime
  gender      String
  diagnosis   String?
  institution String?
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  createdAt   DateTime @default(now())
  cases       Case[]
}

model Case {
  id           String        @id @default(cuid())
  caseNumber   String        @unique  // ICF-YYYY-XXXXXX
  adminId      String
  admin        Admin         @relation(fields: [adminId], references: [id])
  customerId   String
  customer     Customer      @relation(fields: [customerId], references: [id])
  status       CaseStatus    @default(OPEN)
  signaturePath String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  answers      CaseAnswer[]
  summary      CaseSummary?
  aidSelections AidSelection[]
  documents    GeneratedDocument[]
}

enum CaseStatus {
  OPEN
  CLOSED
}

model CaseAnswer {
  id        String @id @default(cuid())
  caseId    String
  case      Case   @relation(fields: [caseId], references: [id], onDelete: Cascade)
  icfCode   String  // z.B. "b130", "d450"
  qualifier Int     // 0–4, 8, 9
  note      String?
}

model CaseSummary {
  id            String @id @default(cuid())
  caseId        String @unique
  case          Case   @relation(fields: [caseId], references: [id], onDelete: Cascade)
  goals         Json   // Array von {description, timeframe}
  environment   Json   // Wohnsituation, Unterstützung
  generatedText Json   // {section1, section2, section3, section4, section5}
}

model AidItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  selections  AidSelection[]
}

model AidSelection {
  id       String  @id @default(cuid())
  caseId   String
  case     Case    @relation(fields: [caseId], references: [id], onDelete: Cascade)
  aidItemId String
  aidItem  AidItem @relation(fields: [aidItemId], references: [id])
  note     String?
}

model GeneratedDocument {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  type      String   // "pdf" | "docx"
  path      String
  createdAt DateTime @default(now())
}

model CleanupRun {
  id               String   @id @default(cuid())
  ranAt            DateTime @default(now())
  deletedCustomers Int
  errors           String?
}

model WizardSession {
  id          String   @id @default(cuid())
  token       String   @unique
  adminId     String
  stepData    Json     @default("{}")
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}
```

---

## HILFSMITTEL-VERWALTUNG (UI-basiert, KEIN Datei-Sync)

Der Boss verwaltet Hilfsmittel **ausschließlich über die Web-Oberfläche**.
Es gibt **keine** Hilfsmittel.md-Datei und keinen Datei-Sync.

**Boss-Dashboard unter `/boss/aids`:**
- Liste aller Hilfsmittel (aktiv/inaktiv, filterbar)
- Formular: Neues Hilfsmittel anlegen (Name Pflicht, Kategorie Pflicht, Beschreibung optional)
- Inline-Bearbeitung: Name, Beschreibung, Kategorie ändern
- Deaktivieren / Reaktivieren (Toggle)
- Löschen (nur wenn deaktiviert, mit Bestätigungsdialog)

**Wizard zeigt nur `isActive = true` Hilfsmittel.**

Beispiel-Hilfsmittel (als Seed-Daten, nicht als Datei):
- Rollator
- Rollstuhl (manuell)
- Rollstuhl (elektrisch)
- Badewannenlift
- Duschstuhl
- Greifzange
- Toilettensitzerhöhung
- Pflegebett
- Antirutschmatte
- Kommunikationshilfe
- Hörgerät
- Gehstock
- Krücken (Unterarmstützen)
- Treppensteiger

---

## TEXTGENERATOR (REGELBASIERT, DETERMINISTISCH)

Der Generator erstellt 5 Textabschnitte basierend auf den ICF-Answers.
Auswahl der Variante: `caseId.charCodeAt(0) % 5` (deterministisch, kein Zufall).

### Abschnitt 1 – Funktionelle Einschränkungen
Basis: Qualifier der b-Codes.
Regel: Bei Qualifier ≥ 2 in b280 → Text erwähnt Schmerzen als Hauptfaktor.
Bei Qualifier ≥ 2 in b710/b730 → Text erwähnt Bewegungs-/Krafteinschränkungen.
5 Textvarianten pro Kombination.

### Abschnitt 2 – Aktivität und Teilhabe
Basis: Qualifier der d-Codes.
Regel: d450 Qualifier → Aussagen über Gehfähigkeit.
d510/d530/d550 → Aussagen über Selbstversorgung.
d850 → Aussagen über Erwerbsfähigkeit.

### Abschnitt 3 – Umweltfaktoren
Basis: e-Codes + Wohnsituation + Unterstützungspersonen.
Regel: e310 Qualifier 0–1 → gute soziale Unterstützung erwähnen.
e310 Qualifier 3–4 → mangelnde Unterstützung als Barriere.

### Abschnitt 4 – Hilfsmittelbegründung
Basis: Ausgewählte AidItems + relevante ICF-Codes.
Regel: Pro ausgewähltem Hilfsmittel ein Satz zur Begründung.
Verknüpfung mit dem passenden ICF-Code (z.B. Rollator → d450, Duschstuhl → d510).

### Abschnitt 5 – Schluss / Empfehlung
Basis: Ziele + Gesamtbild.
Regel: Ziele wörtlich einbinden.
Zeithorizont beeinflusst Formulierung (kurzfristig → „unmittelbar", langfristig → „perspektivisch").

**Jeder Abschnitt hat 5 Textvarianten auf DE, EN, FR.**
Keine TODO-Platzhalter. Alle Texte vollständig ausformuliert.

---

## PDF + DOCX EXPORT (nur Admin)

Route: `POST /api/admin/cases/[id]/export`

**Inhalt des Dokuments:**
1. Header mit Logo-Platzhalter und Fallnummer
2. Teilnehmer-ID (`TN-XXXXXX`), Alter, Geschlecht, Diagnose (kein Name)
3. ICF-Codes mit Qualifier und Notizen (tabellarisch)
4. Ziele (mit Zeithorizont)
5. Umweltfaktoren (Zusammenfassung)
6. Ausgewählte Hilfsmittel
7. Generierter Text (alle 5 Abschnitte)
8. Unterschrift (eingebettet als Bild)
9. Datum der Erstellung

**Speicherung:**
- `/uploads/documents/{case_id}.pdf`
- `/uploads/documents/{case_id}.docx`
- Eintrag in `GeneratedDocument`

---

## MEHRSPRACHIGKEIT

Unterstützte Sprachen: **de** (Default), **en**, **fr**

Struktur:
```
/content/i18n/de.json
/content/i18n/en.json
/content/i18n/fr.json

/content/legal/de/datenschutz.md
/content/legal/de/nutzungsbedingungen.md
/content/legal/en/privacy.md
/content/legal/en/terms.md
/content/legal/fr/confidentialite.md
/content/legal/fr/conditions.md
```

Language Switcher im Header (alle Bereiche: Wizard, Admin, Boss).
Fallback: de.
**Alle Texte vollständig übersetzt. Keine TODO-Platzhalter.**

---

## 365-TAGE RETENTION (DSGVO)

Basis: `Customer.createdAt`
Schwellwert: `RETENTION_DAYS` (ENV, Default: 365)

**Löschreihenfolge:**
1. Signaturdateien löschen (`/uploads/signatures/`)
2. PDF/DOCX-Dateien löschen (`/uploads/documents/`)
3. `AidSelection` löschen
4. `CaseAnswer` löschen
5. `CaseSummary` löschen
6. `GeneratedDocument` löschen
7. `WizardSession` löschen
8. `Case` löschen
9. `Customer` löschen

**Protokollierung** in `CleanupRun`.

**Cron:** täglich 02:00 Uhr
**Manueller Trigger:** `POST /api/boss/cleanup` (Boss-JWT erforderlich)

---

## SECURITY

- bcrypt 12 Runden für alle Passwörter
- JWT in HttpOnly Cookie, SameSite=Strict, Secure (prod)
- Rate Limiting: max 5 Login-Versuche / 15 Min pro IP
- CORS: nur `APP_URL`
- HTTP-Header: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Non-root Docker User (uid 1001)
- Keine Stack Traces im Frontend
- WizardSession Token: crypto.randomBytes(32).toString('hex')
- Session-Expiry: 24h nach Start

---

## SELF-HOSTED DEPLOYMENT

```
/deploy/selfhosted/
  docker-compose.yml       # app + postgres + caddy
  Dockerfile               # Multi-Stage Production Build
  .env.example             # Alle ENV-Variablen dokumentiert
  INSTALL.md               # Schritt-für-Schritt Installationsanleitung
  UPDATE.md                # Update-Prozedur
  BACKUP_RESTORE.md        # Backup & Restore mit Beispielen
  scripts/
    init.sh                # prisma migrate deploy + Boss anlegen + Seeds
    backup.sh              # DB-Dump + Uploads-Archiv
    restore.sh             # Restore aus Backup
```

**ENV-Variablen (mindestens):**
```env
DATABASE_URL=
JWT_SECRET=
BOSS_EMAIL=
BOSS_PASSWORD=
APP_URL=
RETENTION_DAYS=365
UPLOAD_DIR=/app/uploads
NODE_ENV=production
```

---

## TESTUMGEBUNG (PRIVATER TEST VOR PRODUKTION)

**Wichtig:** Die Testinstanz läuft vollständig getrennt vom Produktiv-System.

### Aufbau der Testkopie

Ordnerstruktur:
```
/deploy/selfhosted/test/
  docker-compose.test.yml  # Separate Container, andere Ports
  .env.test                # Eigene Testdatenbank, eigenes Verzeichnis
  README_TEST.md           # Anleitung zum Starten der Testinstanz
```

**`docker-compose.test.yml`-Besonderheiten:**
- App läuft auf Port 3001 (nicht 3000)
- Eigene Postgres-Instanz auf Port 5433
- Eigenes Volume: `icf_test_postgres_data`
- Upload-Ordner: `/tmp/icf-test-uploads`
- Kein Caddy (kein HTTPS nötig für lokalen Test)
- Container-Namen mit Prefix `icf-test-`

**`.env.test`:**
```env
DATABASE_URL=postgresql://icf_test:test_pass@postgres-test:5432/icf_test
JWT_SECRET=test-secret-not-for-production
BOSS_EMAIL=boss@test.local
BOSS_PASSWORD=TestBoss123!
APP_URL=http://localhost:3001
RETENTION_DAYS=365
UPLOAD_DIR=/tmp/icf-test-uploads
NODE_ENV=development
```

**Testdaten (automatisch via `init.sh --test`):**
- 1 Boss-Account (aus .env.test)
- 2 Test-Admins mit bekannten Referral-Codes:
  - Admin 1: `testref01`, Link: `http://localhost:3001/start?ref=testref01`
  - Admin 2: `testref02`, Link: `http://localhost:3001/start?ref=testref02`
- 5 Test-Hilfsmittel (Rollator, Rollstuhl, Duschstuhl, Gehstock, Pflegebett)
- 2 Test-Fälle (einer offen, einer abgeschlossen)

**Test-Checkliste (`README_TEST.md`):**
```
□ Boss-Login unter http://localhost:3001/boss/login
□ Admin anlegen und Affiliate-Link kopieren
□ Wizard komplett durchlaufen (http://localhost:3001/start?ref=testref01)
□ Fallnummer notieren
□ Admin-Login, Fall einsehen
□ PDF-Export testen
□ DOCX-Export testen
□ Sprachumschalter testen (de/en/fr)
□ Hilfsmittel anlegen/bearbeiten/deaktivieren (Boss)
□ Retention manuell triggern (Boss)
□ Admin deaktivieren/reaktivieren (Boss)
```

**Starten der Testinstanz:**
```bash
cd deploy/selfhosted/test
docker compose -f docker-compose.test.yml up -d
docker exec icf-test-app sh /app/scripts/init.sh --test
# App erreichbar unter http://localhost:3001
```

**Testinstanz löschen:**
```bash
docker compose -f docker-compose.test.yml down -v
# Löscht alle Test-Container und Test-Volumes
# Produktiv-System unberührt
```

---

## GITHUB WORKFLOW & CLAUDE CODE ARBEITSMODUS

Die App wird mit **Git/GitHub** versioniert. Jedes Feature wird als separater Branch entwickelt.

### Claude Code Arbeitsmodus (Pflicht vor jedem Feature)

Bevor Claude Code mit der Implementierung beginnt, stellt es dem Entwickler genau diese 3 Fragen:

1. **Ziel des Features** (1 Satz) – Was soll nach diesem Feature anders/neu sein?
2. **3 Akzeptanzkriterien** – Woran erkennen wir, dass das Feature fertig ist?
3. **Schnelltest (2 Minuten)** – Wie testen wir das sofort manuell?

Erst nach Beantwortung dieser 3 Fragen beginnt Claude Code mit dem Code.

### Branch-Konvention

```
feat/<kurzbeschreibung>      # Neues Feature
fix/<kurzbeschreibung>       # Bugfix
chore/<kurzbeschreibung>     # Infrastruktur, Deps, Refactoring
```

Beispiele:
- `feat/wizard-step7-freitext`
- `feat/admin-hilfsmittel-zuordnung`
- `fix/referral-validation`

### Commit Message Format

```
feat: <was wurde hinzugefügt>
fix: <was wurde behoben>
chore: <was wurde geändert>
```

Beispiele:
- `feat: Wizard Step 7 Freitext für Endnutzer`
- `fix: Referral-Code Validierung schlägt bei Großbuchstaben fehl`

### Workflow pro Feature (Claude Code führt das durch)

```
1. git checkout -b feat/<kurz>
2. Implementierung + minimale Tests
3. git add . && git commit -m "feat: <kurz>"
4. git push origin feat/<kurz>
5. PR-Text erstellen (siehe Format unten)
6. Stoppe und sag: "✅ Ready for review – PR-Text siehe unten."
```

### PR-Text Format (Claude Code erstellt diesen automatisch)

```markdown
## What
<1–2 Sätze was dieses PR macht>

## How to test
1. <Schritt 1>
2. <Schritt 2>
3. Erwartetes Ergebnis: <...>

## Notes
- <Technische Entscheidungen oder Abhängigkeiten>
- <Breaking Changes falls vorhanden>
```

### GitHub Repository Struktur

```
.github/
  pull_request_template.md   # PR-Template (What / How to test / Notes)
  workflows/
    ci.yml                   # Lint + TypeScript Check bei jedem Push
```

**CI-Pipeline (`ci.yml`) prüft:**
- `npm run lint` (ESLint)
- `npm run type-check` (tsc --noEmit)
- `npx prisma validate` (Schema-Validierung)

---

## ABSCHLUSS-DOKUMENTATION (CLAUDE.md)

Nach vollständiger Implementierung erstelle `/CLAUDE.md` mit:
1. Architekturübersicht (Ordnerstruktur, Datenfluss)
2. Rollenmodell und Berechtigungen
3. Mandantenlogik (wie Datentrennung erzwungen wird)
4. Deployment-Beschreibung (Prod + Test)
5. Sicherheitsentscheidungen und deren Begründung
6. ICF-Datenmodell (Codes, Qualifier, Mapping)
7. Textgenerator-Logik (Regeln und Varianten)
8. Bekannte Einschränkungen / TODOs

---

## PROJEKTZIEL

Die ICF Web App ist:
- **Multi-Tenant** (Mandantentrennung via adminId, serverseitig erzwungen)
- **Affiliate-basiert** (kein Endnutzer-Login, nur Link)
- **ICF-konform** (WHO-Klassifikation, Qualifier 0–4)
- **Regelbasiert** (kein KI, kein GPT)
- **Mehrsprachig** (DE/EN/FR, vollständig)
- **DSGVO-konform** (365-Tage Retention, automatische Löschung)
- **Self-Hosted** (Docker, PostgreSQL, Caddy)
- **Produktionsreif** (Security, Logging, Error Handling)
- **Testbar** (isolierte Testumgebung, Checkliste)

