#!/bin/sh
set -e

echo "── ICF Setup ────────────────────────────────────────────────────────────"

# 1. Run Prisma migrations
echo "→ Prisma Migrationen ausführen..."
npx prisma migrate deploy

# 2. Seed AidItems (idempotent)
echo "→ Hilfsmittel-Seed ausführen..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AIDS = [
  { name: 'Rollator', category: 'Mobilität', description: 'Gehrahmen mit Rädern für sichere Fortbewegung' },
  { name: 'Rollstuhl (manuell)', category: 'Mobilität', description: 'Manuell betriebener Rollstuhl' },
  { name: 'Rollstuhl (elektrisch)', category: 'Mobilität', description: 'Elektrisch angetriebener Rollstuhl' },
  { name: 'Gehstock', category: 'Mobilität', description: 'Einfacher Gehstock zur Gehunterstützung' },
  { name: 'Krücken (Unterarmstützen)', category: 'Mobilität', description: 'Unterarmgehstützen für Entlastung' },
  { name: 'Treppensteiger', category: 'Mobilität', description: 'Elektrisches Gerät zum Überwinden von Treppen' },
  { name: 'Badewannenlift', category: 'Bad & Sanitär', description: 'Hebe- und Senkvorrichtung für die Badewanne' },
  { name: 'Duschstuhl', category: 'Bad & Sanitär', description: 'Stabiler Stuhl für sicheres Duschen im Sitzen' },
  { name: 'Toilettensitzerhöhung', category: 'Bad & Sanitär', description: 'Erhöhung des Toilettensitzes für einfacheres Aufstehen' },
  { name: 'Antirutschmatte', category: 'Sicherheit', description: 'Rutschfeste Matte für Bad, Dusche oder Küche' },
  { name: 'Pflegebett', category: 'Pflege', description: 'Höhenverstellbares Bett mit Seitengeländern und Aufrichthilfe' },
  { name: 'Greifzange', category: 'Alltagshilfe', description: 'Verlängerter Greifer für Gegenstände ohne Bücken' },
  { name: 'Hörgerät', category: 'Kommunikation', description: 'Hörgerät zur Verbesserung der Hörfähigkeit' },
  { name: 'Kommunikationshilfe', category: 'Kommunikation', description: 'Elektronische oder einfache Hilfsmittel zur Kommunikation' },
];
async function run() {
  for (const aid of AIDS) {
    await prisma.aidItem.upsert({ where: { name: aid.name }, update: {}, create: aid });
  }
  console.log('✓ ' + AIDS.length + ' Hilfsmittel bereit.');
  await prisma.\$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
"

# 3. Boss-Account anlegen (via instrumentation – läuft beim App-Start automatisch)
echo "✓ Boss-Account wird beim ersten App-Start aus BOSS_EMAIL/BOSS_PASSWORD angelegt."

echo "── Setup abgeschlossen ──────────────────────────────────────────────────"
