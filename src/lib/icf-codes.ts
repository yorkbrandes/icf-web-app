export type IcfCode = {
  code: string;
  de: string;
  en: string;
  fr: string;
  descriptionDe?: string;
};

export const ICF_B_CODES: IcfCode[] = [
  {
    code: "b130",
    de: "Energie und Antrieb",
    en: "Energy and drive",
    fr: "Énergie et pulsions",
    descriptionDe: "Allgemeines geistiges Aktivierungsniveau, Motivation und Antrieb",
  },
  {
    code: "b152",
    de: "Emotionale Funktionen",
    en: "Emotional functions",
    fr: "Fonctions émotionnelles",
    descriptionDe: "Spezifische mentale Funktionen der Gefühle und affektiven Komponenten",
  },
  {
    code: "b280",
    de: "Schmerz",
    en: "Sensation of pain",
    fr: "Sensation de douleur",
    descriptionDe: "Unangenehme Empfindung, die mögliche oder tatsächliche Schäden anzeigt",
  },
  {
    code: "b455",
    de: "Belastungstoleranz",
    en: "Exercise tolerance functions",
    fr: "Fonctions de tolérance à l'effort",
    descriptionDe: "Funktionen der Herzkreislauf- und Atemkapazität bei körperlicher Anstrengung",
  },
  {
    code: "b710",
    de: "Gelenkbeweglichkeit",
    en: "Mobility of joint functions",
    fr: "Fonctions de la mobilité des articulations",
    descriptionDe: "Funktionen des Bewegungsausmaßes und der Leichtigkeit der Gelenkbewegungen",
  },
  {
    code: "b730",
    de: "Muskelkraft",
    en: "Muscle power functions",
    fr: "Fonctions de la force musculaire",
    descriptionDe: "Funktionen der Kraft und des Kraftaufbaus eines Muskels oder einer Muskelgruppe",
  },
];

export const ICF_D_CODES: IcfCode[] = [
  {
    code: "d410",
    de: "Körperlage wechseln",
    en: "Changing basic body position",
    fr: "Changer de position corporelle de base",
    descriptionDe: "Bewegungen, um in eine andere Körperlage zu kommen (Aufsetzen, Aufstehen, Hinlegen)",
  },
  {
    code: "d415",
    de: "In einer Körperlage verbleiben",
    en: "Maintaining a body position",
    fr: "Maintenir une position corporelle",
    descriptionDe: "Verbleiben in der gleichen Körperposition so lange wie erforderlich",
  },
  {
    code: "d450",
    de: "Gehen",
    en: "Walking",
    fr: "Marcher",
    descriptionDe: "Sich zu Fuß auf einer Oberfläche fortbewegen",
  },
  {
    code: "d470",
    de: "Transportmittel benutzen",
    en: "Using transportation",
    fr: "Utiliser des moyens de transport",
    descriptionDe: "Benutzung von Transportmitteln (Bus, Bahn, Taxi, Auto)",
  },
  {
    code: "d510",
    de: "Sich waschen",
    en: "Washing oneself",
    fr: "Se laver",
    descriptionDe: "Den eigenen Körper waschen und abtrocknen",
  },
  {
    code: "d530",
    de: "Toilette benutzen",
    en: "Toileting",
    fr: "Aller aux toilettes",
    descriptionDe: "Regulierung und Vorgänge der Ausscheidung und der Intimhygiene",
  },
  {
    code: "d550",
    de: "Essen",
    en: "Eating",
    fr: "Manger",
    descriptionDe: "Koordinierte Aktionen und Aufgaben des Essens",
  },
  {
    code: "d640",
    de: "Hausarbeiten erledigen",
    en: "Doing housework",
    fr: "Faire le ménage",
    descriptionDe: "Führen und Bewältigen des Haushalts und der täglichen Verrichtungen",
  },
  {
    code: "d760",
    de: "Familienbeziehungen",
    en: "Family relationships",
    fr: "Relations familiales",
    descriptionDe: "Verwandtschaftsbeziehungen innerhalb der Familie",
  },
  {
    code: "d850",
    de: "Bezahlte Tätigkeit",
    en: "Remunerative employment",
    fr: "Travail rémunéré",
    descriptionDe: "Engagement in allen Aspekten der Arbeit",
  },
];

export const ICF_E_CODES: IcfCode[] = [
  {
    code: "e110",
    de: "Produkte für den persönlichen Gebrauch",
    en: "Products or substances for personal consumption",
    fr: "Produits ou substances à usage personnel",
    descriptionDe: "Nahrungs- und Arzneimittel sowie andere Produkte für den persönlichen Gebrauch",
  },
  {
    code: "e115",
    de: "Hilfsmittel für den persönlichen Gebrauch",
    en: "Products and technology for personal use in daily living",
    fr: "Produits et technologie pour l'usage personnel dans la vie quotidienne",
    descriptionDe: "Ausrüstungen, Produkte und Technologien für den täglichen Gebrauch",
  },
  {
    code: "e310",
    de: "Engster Familienkreis",
    en: "Immediate family",
    fr: "Famille proche",
    descriptionDe: "Personen, die durch Geburt, Heirat oder andere kulturell anerkannte Beziehungen verwandt sind",
  },
  {
    code: "e355",
    de: "Fachleute der Gesundheitsberufe",
    en: "Health professionals",
    fr: "Professionnels de la santé",
    descriptionDe: "Alle Dienstleistungsanbieter, die im Gesundheitssystem tätig sind",
  },
  {
    code: "e580",
    de: "Gesundheitsdienste",
    en: "Health services, systems and policies",
    fr: "Services, systèmes et politiques de santé",
    descriptionDe: "Dienste, Systeme und Strategien zur Prävention und Behandlung",
  },
];

export const QUALIFIER_OPTIONS = [0, 1, 2, 3, 4, 8, 9] as const;

export function getIcfLabel(code: string, locale: "de" | "en" | "fr"): string {
  const all = [...ICF_B_CODES, ...ICF_D_CODES, ...ICF_E_CODES];
  const found = all.find((c) => c.code === code);
  if (!found) return code;
  return found[locale];
}
