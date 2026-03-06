import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  Packer,
} from "docx";
import { getIcfLabel } from "./icf-codes";

const QUALIFIER_LABELS: Record<number, string> = {
  0: "0 – kein Problem",
  1: "1 – leichtes Problem",
  2: "2 – mäßiges Problem",
  3: "3 – erhebliches Problem",
  4: "4 – vollständiges Problem",
  8: "8 – nicht spezifiziert",
  9: "9 – nicht anwendbar",
};

type DocxData = {
  caseNumber: string;
  createdAt: Date;
  customer: { participantId: string; age: number; gender: string; diagnosis: string | null };
  answers: { icfCode: string; qualifier: number; note: string | null }[];
  goals: { description: string; timeframe: string }[];
  environment: { livingSituation: string; supportPersons: string };
  aidSelections: { name: string; note: string | null }[];
  generatedText: { section1: string; section2: string; section3: string; section4: string; section5: string };
};

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
}

function labelValue(label: string, value: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value }),
    ],
    spacing: { after: 60 },
  });
}

function icfTable(answers: DocxData["answers"]) {
  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Code", bold: true })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bezeichnung", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qualifier", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Anmerkung", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
    ],
  });

  const dataRows = answers.map(
    (a) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(a.icfCode)], width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(getIcfLabel(a.icfCode, "de"))], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(QUALIFIER_LABELS[a.qualifier] ?? String(a.qualifier))], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(a.note ?? "–")], width: { size: 30, type: WidthType.PERCENTAGE } }),
        ],
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

export async function generateDocx(data: DocxData): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "ICF-Dokumentation", bold: true, size: 36 })],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Fallnummer: ${data.caseNumber} · Erstellt: ${new Date(data.createdAt).toLocaleDateString("de-DE")}`,
                color: "666666",
              }),
            ],
            spacing: { after: 240 },
          }),

          heading("Teilnehmerdaten"),
          labelValue("Teilnehmer-ID", data.customer.participantId),
          labelValue("Alter", `${data.customer.age} Jahre`),
          labelValue("Geschlecht", data.customer.gender),
          labelValue("Diagnose", data.customer.diagnosis ?? "–"),

          heading("ICF-Einschätzungen"),
          icfTable(data.answers),

          heading("Ziele"),
          ...(data.goals.length === 0
            ? [new Paragraph("–")]
            : data.goals.map((g) => labelValue(g.timeframe, g.description))),

          heading("Umweltfaktoren"),
          labelValue("Wohnsituation", data.environment.livingSituation || "–"),
          labelValue("Unterstützungspersonen", data.environment.supportPersons || "–"),

          heading("Zugeordnete Hilfsmittel"),
          ...(data.aidSelections.length === 0
            ? [new Paragraph("Keine Hilfsmittel zugeordnet.")]
            : data.aidSelections.map(
                (s) =>
                  new Paragraph({
                    children: [
                      new TextRun({ text: `• ${s.name}`, bold: true }),
                      ...(s.note ? [new TextRun({ text: ` – ${s.note}` })] : []),
                    ],
                    spacing: { after: 60 },
                  })
              )),

          heading("Funktionsbericht"),
          new Paragraph({ text: data.generatedText.section1, spacing: { after: 120 } }),
          new Paragraph({ text: data.generatedText.section2, spacing: { after: 120 } }),
          new Paragraph({ text: data.generatedText.section3, spacing: { after: 120 } }),
          new Paragraph({ text: data.generatedText.section4, spacing: { after: 120 } }),
          new Paragraph({ text: data.generatedText.section5, spacing: { after: 120 } }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
