import type { IcfAnswer, Goal } from "./wizard";

type Locale = "de" | "en" | "fr";

type GeneratorInput = {
  caseId: string;
  icfAnswers: IcfAnswer[];
  eAnswers: IcfAnswer[];
  goals: Goal[];
  livingSituation: string;
  supportPersons: string;
  aidItems: { name: string }[];
  locale?: Locale;
};

export type GeneratedReport = {
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  section5: string;
};

function getQ(answers: IcfAnswer[], code: string): number {
  return answers.find((a) => a.icfCode === code)?.qualifier ?? 9;
}

function variant(caseId: string): 0 | 1 | 2 | 3 | 4 {
  return (caseId.charCodeAt(0) % 5) as 0 | 1 | 2 | 3 | 4;
}

// ── Qualifier → adjective ─────────────────────────────────────────────────────
const adj = {
  de: (q: number) =>
    ["nicht beeinträchtigt", "leicht beeinträchtigt", "mäßig beeinträchtigt", "erheblich beeinträchtigt", "vollständig beeinträchtigt"][q] ?? "nicht beurteilbar",
  en: (q: number) =>
    ["not impaired", "mildly impaired", "moderately impaired", "severely impaired", "completely impaired"][q] ?? "not assessable",
  fr: (q: number) =>
    ["non atteinte", "légèrement atteinte", "modérément atteinte", "sévèrement atteinte", "complètement atteinte"][q] ?? "non évaluable",
};

// ── SECTION 1: Körperfunktionen ───────────────────────────────────────────────
function section1(input: GeneratorInput, v: number, loc: Locale): string {
  const { icfAnswers: a } = input;
  const b130 = getQ(a, "b130"); const b152 = getQ(a, "b152");
  const b280 = getQ(a, "b280"); const b455 = getQ(a, "b455");
  const b710 = getQ(a, "b710"); const b730 = getQ(a, "b730");
  const hasMainPain = b280 >= 2;
  const hasMobLimit = b710 >= 2 || b730 >= 2;

  const frames: Record<Locale, string[]> = {
    de: [
      `Die Erhebung der Körperfunktionen ergibt folgendes Bild: Energie und Antrieb (b130) sind ${adj.de(b130)}, die emotionalen Funktionen (b152) ${adj.de(b152)}.${hasMainPain ? " Schmerz (b280) stellt mit einer Bewertung von " + b280 + " einen wesentlichen einschränkenden Faktor dar." : " Schmerz (b280) ist " + adj.de(b280) + "."} Die Belastungstoleranz (b455) ist ${adj.de(b455)}.${hasMobLimit ? " Gelenkbeweglichkeit (b710) und Muskelkraft (b730) sind beeinträchtigt und schränken die körperliche Funktionsfähigkeit maßgeblich ein." : " Gelenkbeweglichkeit (b710) und Muskelkraft (b730) sind " + adj.de(b710) + " bzw. " + adj.de(b730) + "."}`,
      `Im Bereich der Körperfunktionen zeigt die Befunderhebung: Energie/Antrieb (b130) – ${adj.de(b130)}, emotionale Funktionen (b152) – ${adj.de(b152)}.${hasMainPain ? " Schmerz (b280) wurde mit Qualifier " + b280 + " als erheblicher Faktor bewertet." : " Schmerz (b280) – " + adj.de(b280) + "."} Belastungstoleranz (b455) – ${adj.de(b455)}.${hasMobLimit ? " Die motorischen Funktionen Gelenkbeweglichkeit (b710) und Muskelkraft (b730) sind in einem Ausmaß eingeschränkt, das die Selbstständigkeit beeinträchtigt." : " Gelenkbeweglichkeit (b710) – " + adj.de(b710) + ", Muskelkraft (b730) – " + adj.de(b730) + "."}`,
      `Die Bewertung der Körperfunktionen gemäß ICF ergibt: Energie und Antrieb (b130) sind ${adj.de(b130)}, die emotionalen Funktionen (b152) ${adj.de(b152)}.${hasMainPain ? " Schmerz (b280) besteht in klinisch relevantem Ausmaß (Qualifier " + b280 + ") und beeinflusst das gesamte Funktionsprofil." : ""} Die Belastungstoleranz (b455) ist ${adj.de(b455)}, die Gelenkbeweglichkeit (b710) ${adj.de(b710)} und die Muskelkraft (b730) ${adj.de(b730)}.`,
      `Die ICF-konforme Funktionsanalyse zeigt im Bereich Körperfunktionen: Energie/Antrieb (b130): ${adj.de(b130)}. Emotionale Funktionen (b152): ${adj.de(b152)}.${hasMainPain ? " Schmerz (b280) ist mit Qualifier " + b280 + " als primärer einschränkender Faktor zu werten." : " Schmerz (b280): " + adj.de(b280) + "."} Belastungstoleranz (b455): ${adj.de(b455)}. Gelenkbeweglichkeit (b710): ${adj.de(b710)}. Muskelkraft (b730): ${adj.de(b730)}.${hasMobLimit ? " Die motorischen Einschränkungen bedürfen besonderer therapeutischer Aufmerksamkeit." : ""}`,
      `Für die erhobene Person ergibt die Bewertung der Körperfunktionen nach ICF: Das Niveau von Energie und Antrieb (b130) ist ${adj.de(b130)}, die emotionalen Funktionen (b152) sind ${adj.de(b152)}.${hasMainPain ? " Schmerz (b280) ist mit Qualifier " + b280 + " als klinisch bedeutsam einzustufen und wirkt sich auf weitere Funktionsbereiche aus." : ""} Die Belastungstoleranz (b455) ist ${adj.de(b455)}, Gelenkbeweglichkeit (b710) ${adj.de(b710)} und Muskelkraft (b730) ${adj.de(b730)}.`,
    ],
    en: [
      `Assessment of body functions reveals: Energy and drive (b130) are ${adj.en(b130)}, emotional functions (b152) are ${adj.en(b152)}.${hasMainPain ? " Pain (b280) is a significant limiting factor with a qualifier of " + b280 + "." : " Pain (b280) is " + adj.en(b280) + "."} Exercise tolerance (b455) is ${adj.en(b455)}.${hasMobLimit ? " Joint mobility (b710) and muscle strength (b730) are impaired and substantially affect functional independence." : " Joint mobility (b710) and muscle strength (b730) are " + adj.en(b710) + " and " + adj.en(b730) + " respectively."}`,
      `The ICF body function assessment shows: Energy/drive (b130) – ${adj.en(b130)}, emotional functions (b152) – ${adj.en(b152)}.${hasMainPain ? " Pain (b280) scored qualifier " + b280 + ", representing a major concern." : " Pain (b280) – " + adj.en(b280) + "."} Exercise tolerance (b455) – ${adj.en(b455)}. Joint mobility (b710) – ${adj.en(b710)}, muscle strength (b730) – ${adj.en(b730)}.`,
      `Body function evaluation per ICF: Energy and drive (b130): ${adj.en(b130)}. Emotional functions (b152): ${adj.en(b152)}.${hasMainPain ? " Pain (b280) is clinically relevant (qualifier " + b280 + ") and influences the overall functional profile." : ""} Exercise tolerance (b455): ${adj.en(b455)}. Joint mobility (b710): ${adj.en(b710)}. Muscle strength (b730): ${adj.en(b730)}.`,
      `ICF body function analysis: Energy/drive (b130): ${adj.en(b130)}. Emotional functions (b152): ${adj.en(b152)}.${hasMainPain ? " Pain (b280) at qualifier " + b280 + " is the primary limiting factor." : " Pain (b280): " + adj.en(b280) + "."} Exercise tolerance (b455): ${adj.en(b455)}. Joint mobility (b710): ${adj.en(b710)}. Muscle strength (b730): ${adj.en(b730)}.${hasMobLimit ? " Motor limitations require specific therapeutic attention." : ""}`,
      `Body functions assessment for this participant: Energy and drive (b130) are ${adj.en(b130)}, emotional functions (b152) are ${adj.en(b152)}.${hasMainPain ? " Pain (b280) at qualifier " + b280 + " is clinically significant and impacts other functional domains." : ""} Exercise tolerance (b455) is ${adj.en(b455)}, joint mobility (b710) is ${adj.en(b710)}, and muscle strength (b730) is ${adj.en(b730)}.`,
    ],
    fr: [
      `L'évaluation des fonctions corporelles révèle : énergie et pulsions (b130) – ${adj.fr(b130)}, fonctions émotionnelles (b152) – ${adj.fr(b152)}.${hasMainPain ? " La douleur (b280) constitue un facteur limitant majeur avec un qualificatif de " + b280 + "." : " La douleur (b280) est " + adj.fr(b280) + "."} La tolérance à l'effort (b455) est ${adj.fr(b455)}.${hasMobLimit ? " La mobilité articulaire (b710) et la force musculaire (b730) sont atteintes et affectent sensiblement l'autonomie." : " La mobilité articulaire (b710) est " + adj.fr(b710) + " et la force musculaire (b730) est " + adj.fr(b730) + "."}`,
      `L'analyse des fonctions corporelles selon la CIF indique : énergie/pulsions (b130) – ${adj.fr(b130)}, fonctions émotionnelles (b152) – ${adj.fr(b152)}.${hasMainPain ? " La douleur (b280) a été évaluée à " + b280 + ", ce qui en fait un facteur cliniquement significatif." : " Douleur (b280) – " + adj.fr(b280) + "."} Tolérance à l'effort (b455) – ${adj.fr(b455)}, mobilité articulaire (b710) – ${adj.fr(b710)}, force musculaire (b730) – ${adj.fr(b730)}.`,
      `Évaluation CIF des fonctions corporelles : énergie et pulsions (b130) : ${adj.fr(b130)}, fonctions émotionnelles (b152) : ${adj.fr(b152)}.${hasMainPain ? " La douleur (b280) est cliniquement pertinente (qualificatif " + b280 + ")." : ""} Tolérance à l'effort (b455) : ${adj.fr(b455)}, mobilité articulaire (b710) : ${adj.fr(b710)}, force musculaire (b730) : ${adj.fr(b730)}.`,
      `Analyse CIF des fonctions corporelles : énergie/pulsions (b130) : ${adj.fr(b130)}, fonctions émotionnelles (b152) : ${adj.fr(b152)}.${hasMainPain ? " La douleur (b280) avec un qualificatif de " + b280 + " est le facteur limitant principal." : " Douleur (b280) : " + adj.fr(b280) + "."} Tolérance à l'effort (b455) : ${adj.fr(b455)}. Mobilité articulaire (b710) : ${adj.fr(b710)}. Force musculaire (b730) : ${adj.fr(b730)}.${hasMobLimit ? " Les limitations motrices nécessitent une attention thérapeutique particulière." : ""}`,
      `Pour ce participant, les fonctions corporelles selon la CIF sont : énergie et pulsions (b130) ${adj.fr(b130)}, fonctions émotionnelles (b152) ${adj.fr(b152)}.${hasMainPain ? " La douleur (b280) au qualificatif " + b280 + " est cliniquement significative et impacte d'autres domaines fonctionnels." : ""} Tolérance à l'effort (b455) : ${adj.fr(b455)}, mobilité articulaire (b710) : ${adj.fr(b710)}, force musculaire (b730) : ${adj.fr(b730)}.`,
    ],
  };

  return frames[loc][v];
}

// ── SECTION 2: Aktivitäten & Teilhabe ────────────────────────────────────────
function section2(input: GeneratorInput, v: number, loc: Locale): string {
  const { icfAnswers: a } = input;
  const d450 = getQ(a, "d450"); const d510 = getQ(a, "d510");
  const d530 = getQ(a, "d530"); const d550 = getQ(a, "d550");
  const d640 = getQ(a, "d640"); const d850 = getQ(a, "d850");
  const d410 = getQ(a, "d410"); const d415 = getQ(a, "d415");
  const d470 = getQ(a, "d470"); const d760 = getQ(a, "d760");
  const selfCareImpaired = [d510, d530, d550].some((q) => q >= 2);
  const workImpaired = d850 >= 2;

  const frames: Record<Locale, string[]> = {
    de: [
      `Hinsichtlich der Aktivitäten und Teilhabe zeigt sich: Gehen (d450) ist ${adj.de(d450)}, Körperlage wechseln (d410) ${adj.de(d410)} und in einer Körperlage verbleiben (d415) ${adj.de(d415)}.${selfCareImpaired ? " Die Selbstversorgung ist beeinträchtigt: Sich waschen (d510) – " + adj.de(d510) + ", Toilette benutzen (d530) – " + adj.de(d530) + ", Essen (d550) – " + adj.de(d550) + "." : " Die Selbstversorgungsfähigkeiten (d510, d530, d550) sind weitgehend erhalten."} Hausarbeiten erledigen (d640) ist ${adj.de(d640)}, Transportmittel benutzen (d470) ${adj.de(d470)}.${workImpaired ? " Die Erwerbsfähigkeit (d850) ist erheblich beeinträchtigt." : " Die Familienbeziehungen (d760) sind " + adj.de(d760) + "."}`,
      `Im Bereich Aktivitäten und Teilhabe ergibt die Erhebung: Mobilität – Gehen (d450): ${adj.de(d450)}, Lagenwechsel (d410): ${adj.de(d410)}, Positionsstabilität (d415): ${adj.de(d415)}.${selfCareImpaired ? " Selbstversorgung eingeschränkt: Waschen (d510): " + adj.de(d510) + ", Toilette (d530): " + adj.de(d530) + ", Essen (d550): " + adj.de(d550) + "." : ""} Haushaltsführung (d640): ${adj.de(d640)}, Fortbewegung/Transport (d470): ${adj.de(d470)}, Familienbeziehungen (d760): ${adj.de(d760)}.${workImpaired ? " Bezahlte Tätigkeit (d850) ist nicht oder kaum möglich." : ""}`,
      `Die Aktivitäts- und Teilhabebewertung nach ICF ergibt: Beim Gehen (d450) ist die Person ${adj.de(d450)}.${selfCareImpaired ? " Die Selbstversorgung ist teilweise eingeschränkt (d510: " + adj.de(d510) + ", d530: " + adj.de(d530) + ", d550: " + adj.de(d550) + ")." : " Die Selbstversorgung (d510, d530, d550) gelingt eigenständig."} Hausarbeiten (d640): ${adj.de(d640)}, Transport (d470): ${adj.de(d470)}.${workImpaired ? " Die Teilhabe an bezahlter Arbeit (d850) ist durch die Einschränkungen maßgeblich beeinträchtigt." : ""}`,
      `Aktivitäten und Teilhabe gemäß ICF: Gehen (d450) – ${adj.de(d450)}, Körperlage wechseln/verbleiben (d410/d415) – ${adj.de(d410)}/${adj.de(d415)}.${selfCareImpaired ? " Selbstversorgungsdefizite vorhanden (Waschen, Toilette, Essen beeinträchtigt)." : " Selbstversorgung nicht eingeschränkt."} Hausarbeiten (d640): ${adj.de(d640)}, Transport (d470): ${adj.de(d470)}, Familienbeziehungen (d760): ${adj.de(d760)}, Erwerbstätigkeit (d850): ${adj.de(d850)}.`,
      `Die erhobene Person zeigt folgende Aktivitäts- und Teilhabesituation: Gehen (d450) ist ${adj.de(d450)}, was die Mobilität im Alltag ${d450 >= 2 ? "wesentlich" : "kaum"} einschränkt. Körperhaltungswechsel (d410) gelingt ${adj.de(d410)}.${selfCareImpaired ? " Selbstversorgungseinschränkungen (d510, d530, d550) wurden dokumentiert und beeinflussen die Alltagsautonomie erheblich." : ""} Haushaltsführung (d640): ${adj.de(d640)}.${workImpaired ? " Die Erwerbstätigkeit (d850) ist aktuell nicht oder nur eingeschränkt möglich." : ""}`,
    ],
    en: [
      `Activities and participation assessment: Walking (d450) is ${adj.en(d450)}, changing body position (d410) is ${adj.en(d410)}, maintaining position (d415) is ${adj.en(d415)}.${selfCareImpaired ? " Self-care is impaired: washing (d510) – " + adj.en(d510) + ", toileting (d530) – " + adj.en(d530) + ", eating (d550) – " + adj.en(d550) + "." : " Self-care abilities (d510, d530, d550) are largely preserved."} Housework (d640): ${adj.en(d640)}, transportation (d470): ${adj.en(d470)}.${workImpaired ? " Employment (d850) is substantially impaired." : ""}`,
      `ICF activities and participation: Mobility – walking (d450): ${adj.en(d450)}, position change (d410): ${adj.en(d410)}, position maintenance (d415): ${adj.en(d415)}.${selfCareImpaired ? " Self-care deficits: washing (d510): " + adj.en(d510) + ", toileting (d530): " + adj.en(d530) + ", eating (d550): " + adj.en(d550) + "." : ""} Housework (d640): ${adj.en(d640)}, transport (d470): ${adj.en(d470)}, family relationships (d760): ${adj.en(d760)}.${workImpaired ? " Remunerative employment (d850) is not or barely possible." : ""}`,
      `Activity and participation findings per ICF: Walking ability (d450) is ${adj.en(d450)}.${selfCareImpaired ? " Self-care is partially impaired (d510: " + adj.en(d510) + ", d530: " + adj.en(d530) + ", d550: " + adj.en(d550) + ")." : " Self-care (d510, d530, d550) is managed independently."} Housework (d640): ${adj.en(d640)}, transportation (d470): ${adj.en(d470)}.${workImpaired ? " Participation in remunerative employment (d850) is substantially impaired." : ""}`,
      `Activities and participation (ICF): Walking (d450) – ${adj.en(d450)}, position change/maintenance (d410/d415) – ${adj.en(d410)}/${adj.en(d415)}.${selfCareImpaired ? " Self-care deficits documented (washing, toileting, eating impaired)." : " Self-care not impaired."} Housework (d640): ${adj.en(d640)}, transport (d470): ${adj.en(d470)}, family relationships (d760): ${adj.en(d760)}, employment (d850): ${adj.en(d850)}.`,
      `This participant's activity and participation profile: Walking (d450) is ${adj.en(d450)}, ${d450 >= 2 ? "substantially" : "minimally"} limiting daily mobility. Body position changes (d410) are ${adj.en(d410)}.${selfCareImpaired ? " Self-care impairments (d510, d530, d550) have been documented, significantly affecting daily autonomy." : ""} Housework (d640): ${adj.en(d640)}.${workImpaired ? " Remunerative employment (d850) is currently not or only partially possible." : ""}`,
    ],
    fr: [
      `Évaluation des activités et de la participation : marche (d450) ${adj.fr(d450)}, changement de position (d410) ${adj.fr(d410)}, maintien de position (d415) ${adj.fr(d415)}.${selfCareImpaired ? " Les soins personnels sont affectés : se laver (d510) – " + adj.fr(d510) + ", aller aux toilettes (d530) – " + adj.fr(d530) + ", manger (d550) – " + adj.fr(d550) + "." : " Les capacités d'autosoins (d510, d530, d550) sont largement préservées."} Tâches ménagères (d640) : ${adj.fr(d640)}, transport (d470) : ${adj.fr(d470)}.${workImpaired ? " L'emploi rémunéré (d850) est substantiellement affecté." : ""}`,
      `CIF – activités et participation : mobilité – marche (d450) : ${adj.fr(d450)}, changement de position (d410) : ${adj.fr(d410)}, maintien (d415) : ${adj.fr(d415)}.${selfCareImpaired ? " Déficits d'autosoins : se laver (d510) : " + adj.fr(d510) + ", toilettes (d530) : " + adj.fr(d530) + ", manger (d550) : " + adj.fr(d550) + "." : ""} Tâches ménagères (d640) : ${adj.fr(d640)}, transport (d470) : ${adj.fr(d470)}, relations familiales (d760) : ${adj.fr(d760)}.${workImpaired ? " Le travail rémunéré (d850) est peu ou pas possible." : ""}`,
      `Résultats des activités et de la participation selon la CIF : la marche (d450) est ${adj.fr(d450)}.${selfCareImpaired ? " Les autosoins sont partiellement altérés (d510 : " + adj.fr(d510) + ", d530 : " + adj.fr(d530) + ", d550 : " + adj.fr(d550) + ")." : " Les autosoins (d510, d530, d550) sont gérés de façon autonome."} Tâches ménagères (d640) : ${adj.fr(d640)}, transport (d470) : ${adj.fr(d470)}.${workImpaired ? " La participation au travail rémunéré (d850) est substantiellement altérée." : ""}`,
      `Activités et participation (CIF) : marche (d450) – ${adj.fr(d450)}, changement/maintien de position (d410/d415) – ${adj.fr(d410)}/${adj.fr(d415)}.${selfCareImpaired ? " Déficits d'autosoins documentés (se laver, toilettes, manger altérés)." : " Autosoins non limités."} Tâches ménagères (d640) : ${adj.fr(d640)}, transport (d470) : ${adj.fr(d470)}, relations familiales (d760) : ${adj.fr(d760)}, emploi (d850) : ${adj.fr(d850)}.`,
      `Profil d'activités et de participation : la marche (d450) est ${adj.fr(d450)}, limitant ${d450 >= 2 ? "substantiellement" : "peu"} la mobilité quotidienne. Les changements de position (d410) sont ${adj.fr(d410)}.${selfCareImpaired ? " Des déficits d'autosoins (d510, d530, d550) ont été documentés, affectant considérablement l'autonomie quotidienne." : ""} Tâches ménagères (d640) : ${adj.fr(d640)}.${workImpaired ? " Le travail rémunéré (d850) n'est actuellement pas ou que partiellement possible." : ""}`,
    ],
  };

  return frames[loc][v];
}

// ── SECTION 3: Umweltfaktoren ─────────────────────────────────────────────────
function section3(input: GeneratorInput, v: number, loc: Locale): string {
  const { eAnswers: e, livingSituation, supportPersons } = input;
  const e310 = getQ(e, "e310"); const e355 = getQ(e, "e355");
  const e580 = getQ(e, "e580"); const e110 = getQ(e, "e110");
  const e115 = getQ(e, "e115");
  const goodSupport = e310 <= 1;
  const poorSupport = e310 >= 3;

  const livingDE: Record<string, string> = {
    alone: "allein", withFamily: "mit Familie", assisted: "in betreutem Wohnen", care: "in einer Pflegeeinrichtung"
  };
  const livingEN: Record<string, string> = {
    alone: "alone", withFamily: "with family", assisted: "in assisted living", care: "in a care facility"
  };
  const livingFR: Record<string, string> = {
    alone: "seul(e)", withFamily: "en famille", assisted: "en logement assisté", care: "en établissement de soins"
  };

  const frames: Record<Locale, string[]> = {
    de: [
      `Die Umweltfaktoren gestalten sich folgendermaßen: Die Person lebt ${livingDE[livingSituation] ?? livingSituation}.${supportPersons ? " Unterstützung erfahren sie durch: " + supportPersons + "." : ""}${goodSupport ? " Der engste Familienkreis (e310) stellt eine förderliche Ressource dar." : poorSupport ? " Der engste Familienkreis (e310) steht als Unterstützung nur eingeschränkt zur Verfügung, was eine Barriere darstellt." : ""} Fachleute der Gesundheitsberufe (e355) sind ${adj.de(e355)} erreichbar. Gesundheitsdienste (e580) sind ${adj.de(e580)} zugänglich. Produkte (e110): ${adj.de(e110)}, Hilfsmittel (e115): ${adj.de(e115)}.`,
      `Umweltbezogene Faktoren nach ICF: Wohnsituation – ${livingDE[livingSituation] ?? livingSituation}.${supportPersons ? " Unterstützungspersonen: " + supportPersons + "." : ""}${goodSupport ? " Familie (e310) wirkt als fördernder Faktor." : poorSupport ? " Mangelnde familiäre Unterstützung (e310, Qualifier " + e310 + ") stellt eine Umweltbarriere dar." : " Familiäre Unterstützung (e310) ist " + adj.de(e310) + "."} Gesundheitsfachleute (e355): ${adj.de(e355)}, Gesundheitsdienste (e580): ${adj.de(e580)}.`,
      `Die Erhebung der Umweltfaktoren ergibt: Wohnform – ${livingDE[livingSituation] ?? livingSituation}.${supportPersons ? " Folgende Personen unterstützen die Person: " + supportPersons + "." : ""}${goodSupport ? " Die familiäre Unterstützung (e310) ist als schützender Faktor zu werten." : poorSupport ? " Der Mangel an familiärer Unterstützung (e310) wirkt sich erschwerend auf die Alltagsbewältigung aus." : ""} Zugang zu Gesundheitsfachleuten (e355): ${adj.de(e355)}, Gesundheitsversorgung (e580): ${adj.de(e580)}. Verfügbare Hilfsmittel (e115): ${adj.de(e115)}.`,
      `Umweltanalyse gemäß ICF: Die Person wohnt ${livingDE[livingSituation] ?? livingSituation}. ${supportPersons ? "Unterstützung durch: " + supportPersons + "." : "Keine weiteren Unterstützungspersonen angegeben."}${goodSupport ? " Engster Familienkreis (e310): fördernder Faktor." : poorSupport ? " Engster Familienkreis (e310): Barriere (Qualifier " + e310 + ")." : " Engster Familienkreis (e310): " + adj.de(e310) + "."} Gesundheitsfachleute (e355): ${adj.de(e355)}, Gesundheitsdienste (e580): ${adj.de(e580)}.`,
      `Für die erhobene Person stellen sich die Umweltbedingungen wie folgt dar: Wohnsituation – ${livingDE[livingSituation] ?? livingSituation}.${supportPersons ? " An Unterstützungspersonen stehen zur Verfügung: " + supportPersons + "." : ""}${goodSupport ? " Die familiäre Einbindung (e310) ist als bedeutsame Ressource einzustufen." : poorSupport ? " Die eingeschränkte familiäre Unterstützung (e310, Qualifier " + e310 + ") ist als relevante Barriere zu berücksichtigen." : ""} Gesundheitsfachleute (e355): ${adj.de(e355)}, Produkte für den täglichen Gebrauch (e110): ${adj.de(e110)}, Hilfsmittel (e115): ${adj.de(e115)}.`,
    ],
    en: [
      `Environmental factors: The person lives ${livingEN[livingSituation] ?? livingSituation}.${supportPersons ? " Support from: " + supportPersons + "." : ""}${goodSupport ? " Immediate family (e310) is a beneficial resource." : poorSupport ? " Limited family support (e310) represents an environmental barrier." : ""} Health professionals (e355): ${adj.en(e355)}, health services (e580): ${adj.en(e580)}. Products (e110): ${adj.en(e110)}, assistive devices (e115): ${adj.en(e115)}.`,
      `ICF environmental factors: Living situation – ${livingEN[livingSituation] ?? livingSituation}.${supportPersons ? " Support persons: " + supportPersons + "." : ""}${goodSupport ? " Family (e310) acts as a facilitating factor." : poorSupport ? " Insufficient family support (e310, qualifier " + e310 + ") is an environmental barrier." : " Family support (e310): " + adj.en(e310) + "."} Health professionals (e355): ${adj.en(e355)}, health services (e580): ${adj.en(e580)}.`,
      `Environmental factor assessment: Living arrangement – ${livingEN[livingSituation] ?? livingSituation}.${supportPersons ? " The following persons provide support: " + supportPersons + "." : ""}${goodSupport ? " Family support (e310) acts as a protective factor." : poorSupport ? " Lack of family support (e310) complicates daily functioning." : ""} Access to health professionals (e355): ${adj.en(e355)}, healthcare (e580): ${adj.en(e580)}.`,
      `Environmental analysis (ICF): Living ${livingEN[livingSituation] ?? livingSituation}. ${supportPersons ? "Support from: " + supportPersons + "." : "No additional support persons noted."}${goodSupport ? " Immediate family (e310): facilitating factor." : poorSupport ? " Immediate family (e310): barrier (qualifier " + e310 + ")." : " Immediate family (e310): " + adj.en(e310) + "."} Health professionals (e355): ${adj.en(e355)}, health services (e580): ${adj.en(e580)}.`,
      `Environmental conditions for this participant: Living ${livingEN[livingSituation] ?? livingSituation}.${supportPersons ? " Available support persons: " + supportPersons + "." : ""}${goodSupport ? " Family involvement (e310) is a significant resource." : poorSupport ? " Limited family support (e310, qualifier " + e310 + ") is a relevant barrier." : ""} Health professionals (e355): ${adj.en(e355)}, products (e110): ${adj.en(e110)}, assistive devices (e115): ${adj.en(e115)}.`,
    ],
    fr: [
      `Facteurs environnementaux : la personne vit ${livingFR[livingSituation] ?? livingSituation}.${supportPersons ? " Soutien de : " + supportPersons + "." : ""}${goodSupport ? " La famille proche (e310) constitue une ressource favorable." : poorSupport ? " Le soutien familial insuffisant (e310) représente une barrière environnementale." : ""} Professionnels de la santé (e355) : ${adj.fr(e355)}, services de santé (e580) : ${adj.fr(e580)}. Produits (e110) : ${adj.fr(e110)}, aides techniques (e115) : ${adj.fr(e115)}.`,
      `Facteurs environnementaux CIF : situation de logement – ${livingFR[livingSituation] ?? livingSituation}.${supportPersons ? " Personnes de soutien : " + supportPersons + "." : ""}${goodSupport ? " La famille (e310) est un facteur facilitant." : poorSupport ? " Le manque de soutien familial (e310, qualificatif " + e310 + ") constitue une barrière environnementale." : " Soutien familial (e310) : " + adj.fr(e310) + "."} Professionnels de santé (e355) : ${adj.fr(e355)}, services de santé (e580) : ${adj.fr(e580)}.`,
      `Évaluation des facteurs environnementaux : mode de vie – ${livingFR[livingSituation] ?? livingSituation}.${supportPersons ? " Personnes apportant du soutien : " + supportPersons + "." : ""}${goodSupport ? " Le soutien familial (e310) est un facteur protecteur." : poorSupport ? " L'insuffisance du soutien familial (e310) complique le fonctionnement quotidien." : ""} Accès aux professionnels de santé (e355) : ${adj.fr(e355)}.`,
      `Analyse environnementale (CIF) : vie ${livingFR[livingSituation] ?? livingSituation}. ${supportPersons ? "Soutien de : " + supportPersons + "." : "Aucune personne de soutien supplémentaire mentionnée."}${goodSupport ? " Famille proche (e310) : facteur facilitant." : poorSupport ? " Famille proche (e310) : barrière (qualificatif " + e310 + ")." : " Famille proche (e310) : " + adj.fr(e310) + "."} Professionnels de santé (e355) : ${adj.fr(e355)}, services de santé (e580) : ${adj.fr(e580)}.`,
      `Conditions environnementales du participant : vie ${livingFR[livingSituation] ?? livingSituation}.${supportPersons ? " Personnes de soutien disponibles : " + supportPersons + "." : ""}${goodSupport ? " L'implication familiale (e310) est une ressource significative." : poorSupport ? " Le soutien familial limité (e310, qualificatif " + e310 + ") est une barrière pertinente." : ""} Professionnels de santé (e355) : ${adj.fr(e355)}, produits (e110) : ${adj.fr(e110)}, aides techniques (e115) : ${adj.fr(e115)}.`,
    ],
  };

  return frames[loc][v];
}

// ── SECTION 4: Hilfsmittelbegründung ─────────────────────────────────────────
const aidToCode: Record<string, string> = {
  rollator: "d450", gehhilfe: "d450", gehstock: "d450", krücke: "d450", unterarmstütze: "d450",
  rollstuhl: "d450", "rollstuhl (manuell)": "d450", "rollstuhl (elektrisch)": "d450",
  duschstuhl: "d510", badewannenlift: "d510", badewanne: "d510",
  toilettensitz: "d530", "toilettensitzerhöhung": "d530",
  pflegebett: "d415", antirutschmatte: "d410",
  hörgerät: "b152", kommunikationshilfe: "b152",
  greifzange: "d640", treppensteiger: "d450",
};

function aidCodeHint(aidName: string, loc: Locale): string {
  const key = aidName.toLowerCase();
  const code = Object.entries(aidToCode).find(([k]) => key.includes(k))?.[1];
  if (!code) return "";
  const hints: Record<Locale, Record<string, string>> = {
    de: {
      "d450": " zur Unterstützung der Gehfähigkeit (d450)",
      "d510": " zur Unterstützung der Körperhygiene (d510)",
      "d530": " zur Unterstützung bei der Toilettenbenutzung (d530)",
      "d415": " zur Unterstützung der Positionsstabilität (d415)",
      "d410": " zur Unfallprävention beim Lagewechsel (d410)",
      "d640": " zur Unterstützung bei Hausarbeiten (d640)",
      "b152": " zur Unterstützung der Kommunikation und emotionaler Funktionen (b152)",
    },
    en: {
      "d450": " to support walking ability (d450)",
      "d510": " to support personal hygiene (d510)",
      "d530": " to support toileting (d530)",
      "d415": " to support position maintenance (d415)",
      "d410": " to prevent accidents during position changes (d410)",
      "d640": " to support housework (d640)",
      "b152": " to support communication and emotional functions (b152)",
    },
    fr: {
      "d450": " pour soutenir la marche (d450)",
      "d510": " pour soutenir l'hygiène personnelle (d510)",
      "d530": " pour soutenir l'utilisation des toilettes (d530)",
      "d415": " pour soutenir le maintien de position (d415)",
      "d410": " pour prévenir les accidents lors des changements de position (d410)",
      "d640": " pour soutenir les tâches ménagères (d640)",
      "b152": " pour soutenir la communication et les fonctions émotionnelles (b152)",
    },
  };
  return hints[loc][code] ?? "";
}

function section4(input: GeneratorInput, v: number, loc: Locale): string {
  const { aidItems } = input;
  if (aidItems.length === 0) {
    const empty: Record<Locale, string> = {
      de: "Zum aktuellen Zeitpunkt wurden keine Hilfsmittel zugeordnet.",
      en: "No assistive devices have been assigned at this time.",
      fr: "Aucune aide technique n'a été attribuée pour le moment.",
    };
    return empty[loc];
  }

  const intros: Record<Locale, string[]> = {
    de: [
      "Für die erhobene Person wurden folgende Hilfsmittel als geeignet eingestuft:",
      "Die Hilfsmittelversorgung umfasst nach fachlicher Einschätzung:",
      "Auf Basis der ICF-Befunde wurden folgende Hilfsmittel empfohlen:",
      "Die Hilfsmittelbedarfsanalyse ergibt folgende Zuordnungen:",
      "Zur Förderung der Selbstständigkeit wurden folgende Hilfsmittel identifiziert:",
    ],
    en: [
      "The following assistive devices have been identified as appropriate:",
      "The assistive device provision, based on clinical assessment, includes:",
      "Based on ICF findings, the following assistive devices are recommended:",
      "The assistive device needs analysis yields the following assignments:",
      "To promote independence, the following assistive devices have been identified:",
    ],
    fr: [
      "Les aides techniques suivantes ont été identifiées comme appropriées :",
      "La dotation en aides techniques, selon l'évaluation clinique, comprend :",
      "Sur la base des résultats CIF, les aides techniques suivantes sont recommandées :",
      "L'analyse des besoins en aides techniques donne les affectations suivantes :",
      "Pour favoriser l'autonomie, les aides techniques suivantes ont été identifiées :",
    ],
  };

  const items = aidItems
    .map((a) => `${a.name}${aidCodeHint(a.name, loc)}`)
    .join("; ");

  return `${intros[loc][v]} ${items}.`;
}

// ── SECTION 5: Schluss / Empfehlung ──────────────────────────────────────────
function section5(input: GeneratorInput, v: number, loc: Locale): string {
  const { goals } = input;
  if (goals.length === 0) {
    const empty: Record<Locale, string> = {
      de: "Es wurden keine Therapieziele dokumentiert. Eine Zieldefinition sollte im Rahmen der weiteren Behandlung erfolgen.",
      en: "No therapy goals were documented. Goal setting should take place as part of further treatment.",
      fr: "Aucun objectif thérapeutique n'a été documenté. La définition des objectifs devrait avoir lieu dans le cadre du traitement ultérieur.",
    };
    return empty[loc];
  }

  const timeframeDE: Record<string, string> = {
    short: "unmittelbar", medium: "mittelfristig", long: "perspektivisch"
  };
  const timeframeEN: Record<string, string> = {
    short: "immediately", medium: "in the medium term", long: "in the long term"
  };
  const timeframeFR: Record<string, string> = {
    short: "immédiatement", medium: "à moyen terme", long: "à long terme"
  };

  const tf = { de: timeframeDE, en: timeframeEN, fr: timeframeFR }[loc];

  const goalLines = goals
    .map((g) => `${tf[g.timeframe] ?? g.timeframe}: „${g.description}"`)
    .join("; ");

  const intros: Record<Locale, string[]> = {
    de: [
      `Auf Grundlage der Gesamtbefundlage wurden folgende therapeutische Ziele formuliert: ${goalLines}. Die therapeutischen Maßnahmen sollten auf die Erreichung dieser Ziele ausgerichtet sein.`,
      `Die ICF-Erhebung mündet in folgender Zielformulierung: ${goalLines}. Die Therapieplanung orientiert sich an diesen Zielformulierungen und dem individuellen Funktionsprofil der Person.`,
      `Zusammenfassend lassen sich folgende Ziele ableiten: ${goalLines}. Die Erreichung dieser Ziele sollte durch gezielte Interventionen und, wo indiziert, Hilfsmittelversorgung gefördert werden.`,
      `Die Erhebung schließt mit folgenden Therapiezielen: ${goalLines}. Diese Ziele spiegeln die Prioritäten der Person wider und bilden die Grundlage für das therapeutische Vorgehen.`,
      `Das Gesamtbild der Erhebung empfiehlt folgende Zielorientierung: ${goalLines}. Therapeutische Interventionen sollten sich an diesen Zielen ausrichten und regelmäßig evaluiert werden.`,
    ],
    en: [
      `Based on the overall findings, the following therapeutic goals were formulated: ${goalLines}. Therapeutic measures should be directed toward achieving these goals.`,
      `The ICF assessment results in the following goal formulation: ${goalLines}. Therapy planning is guided by these goals and the individual functional profile.`,
      `In summary, the following goals can be derived: ${goalLines}. Achievement of these goals should be promoted through targeted interventions and, where indicated, assistive device provision.`,
      `The assessment concludes with the following therapy goals: ${goalLines}. These goals reflect the person's priorities and form the basis for therapeutic action.`,
      `The overall assessment picture recommends the following goal orientation: ${goalLines}. Therapeutic interventions should be aligned with these goals and regularly evaluated.`,
    ],
    fr: [
      `Sur la base des résultats globaux, les objectifs thérapeutiques suivants ont été formulés : ${goalLines}. Les mesures thérapeutiques doivent viser à atteindre ces objectifs.`,
      `L'évaluation CIF aboutit à la formulation d'objectifs suivante : ${goalLines}. La planification thérapeutique est guidée par ces objectifs et le profil fonctionnel individuel.`,
      `En résumé, les objectifs suivants peuvent être dégagés : ${goalLines}. L'atteinte de ces objectifs doit être favorisée par des interventions ciblées et, si indiqué, des aides techniques.`,
      `L'évaluation se conclut par les objectifs thérapeutiques suivants : ${goalLines}. Ces objectifs reflètent les priorités de la personne et constituent la base de l'action thérapeutique.`,
      `Le tableau d'ensemble de l'évaluation recommande l'orientation d'objectifs suivante : ${goalLines}. Les interventions thérapeutiques doivent être alignées sur ces objectifs et évaluées régulièrement.`,
    ],
  };

  return intros[loc][v];
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function generateReport(input: GeneratorInput): GeneratedReport {
  const loc: Locale = input.locale ?? "de";
  const v = variant(input.caseId);
  return {
    section1: section1(input, v, loc),
    section2: section2(input, v, loc),
    section3: section3(input, v, loc),
    section4: section4(input, v, loc),
    section5: section5(input, v, loc),
  };
}
