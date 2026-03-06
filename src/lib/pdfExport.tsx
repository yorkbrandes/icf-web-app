import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
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

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", padding: 40, fontSize: 10, color: "#111" },
  header: { borderBottom: "1pt solid #ccc", paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 6, color: "#1e40af" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: "#666" },
  value: { flex: 1 },
  table: { marginTop: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "4 6", fontWeight: "bold" },
  tableRow: { flexDirection: "row", padding: "3 6", borderBottom: "0.5pt solid #e5e7eb" },
  col1: { width: 60 },
  col2: { width: 140 },
  col3: { width: 130 },
  col4: { flex: 1 },
  paragraph: { marginBottom: 6, lineHeight: 1.5 },
  signature: { width: 200, height: 80, marginTop: 8, borderBottom: "1pt solid #999" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#aaa" },
});

type PdfData = {
  caseNumber: string;
  createdAt: Date;
  customer: { participantId: string; age: number; gender: string; diagnosis: string | null };
  answers: { icfCode: string; qualifier: number; note: string | null }[];
  goals: { description: string; timeframe: string }[];
  environment: { livingSituation: string; supportPersons: string };
  aidSelections: { name: string; note: string | null }[];
  generatedText: { section1: string; section2: string; section3: string; section4: string; section5: string };
  signaturePath: string | null;
};

function PdfDocument({ data }: { data: PdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ICF-Dokumentation</Text>
          <Text style={styles.subtitle}>
            Fallnummer: {data.caseNumber} · Erstellt: {new Date(data.createdAt).toLocaleDateString("de-DE")}
          </Text>
        </View>

        {/* Teilnehmerdaten */}
        <Text style={styles.sectionTitle}>Teilnehmerdaten</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Teilnehmer-ID:</Text>
          <Text style={styles.value}>{data.customer.participantId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alter:</Text>
          <Text style={styles.value}>{data.customer.age} Jahre</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Geschlecht:</Text>
          <Text style={styles.value}>{data.customer.gender}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diagnose:</Text>
          <Text style={styles.value}>{data.customer.diagnosis ?? "–"}</Text>
        </View>

        {/* ICF-Einschätzungen */}
        <Text style={styles.sectionTitle}>ICF-Einschätzungen</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Code</Text>
            <Text style={styles.col2}>Bezeichnung</Text>
            <Text style={styles.col3}>Qualifier</Text>
            <Text style={styles.col4}>Anmerkung</Text>
          </View>
          {data.answers.map((a, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{a.icfCode}</Text>
              <Text style={styles.col2}>{getIcfLabel(a.icfCode, "de")}</Text>
              <Text style={styles.col3}>{QUALIFIER_LABELS[a.qualifier] ?? a.qualifier}</Text>
              <Text style={styles.col4}>{a.note ?? "–"}</Text>
            </View>
          ))}
        </View>

        {/* Ziele */}
        <Text style={styles.sectionTitle}>Ziele</Text>
        {data.goals.length === 0 ? (
          <Text>–</Text>
        ) : (
          data.goals.map((g, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{g.timeframe}:</Text>
              <Text style={styles.value}>{g.description}</Text>
            </View>
          ))
        )}

        {/* Umweltfaktoren */}
        <Text style={styles.sectionTitle}>Umweltfaktoren</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Wohnsituation:</Text>
          <Text style={styles.value}>{data.environment.livingSituation || "–"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Unterstützung:</Text>
          <Text style={styles.value}>{data.environment.supportPersons || "–"}</Text>
        </View>

        {/* Hilfsmittel */}
        <Text style={styles.sectionTitle}>Zugeordnete Hilfsmittel</Text>
        {data.aidSelections.length === 0 ? (
          <Text>Keine Hilfsmittel zugeordnet.</Text>
        ) : (
          data.aidSelections.map((s, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>• {s.name}</Text>
              {s.note && <Text style={styles.value}>{s.note}</Text>}
            </View>
          ))
        )}

        {/* Generierter Text */}
        <Text style={styles.sectionTitle}>Funktionsbericht</Text>
        <Text style={styles.paragraph}>{data.generatedText.section1}</Text>
        <Text style={styles.paragraph}>{data.generatedText.section2}</Text>
        <Text style={styles.paragraph}>{data.generatedText.section3}</Text>
        <Text style={styles.paragraph}>{data.generatedText.section4}</Text>
        <Text style={styles.paragraph}>{data.generatedText.section5}</Text>

        {/* Unterschrift */}
        {data.signaturePath && (
          <View>
            <Text style={styles.sectionTitle}>Unterschrift</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.signature} src={data.signaturePath} />
          </View>
        )}

        <Text style={styles.footer}>
          ICF-Dokumentation · {data.caseNumber} · Vertraulich
        </Text>
      </Page>
    </Document>
  );
}

export async function generatePdf(data: PdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<PdfDocument data={data} />);
  return Buffer.from(buffer);
}
