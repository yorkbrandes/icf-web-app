import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePdf } from "@/lib/pdfExport";
import { generateDocx } from "@/lib/docxExport";
import path from "path";
import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await params;
  const type = req.nextUrl.searchParams.get("type") ?? "pdf";

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      customer: true,
      answers: { orderBy: { icfCode: "asc" } },
      summary: true,
      aidSelections: {
        include: { aidItem: { select: { name: true } } },
      },
    },
  });

  if (!caseData || caseData.adminId !== session.adminId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const summary = caseData.summary as {
    goals?: { description: string; timeframe: string }[];
    environment?: { livingSituation?: string; supportPersons?: string };
    generatedText?: { section1: string; section2: string; section3: string; section4: string; section5: string };
  } | null;

  const exportData = {
    caseNumber: caseData.caseNumber,
    createdAt: caseData.createdAt,
    customer: {
      participantId: caseData.customer.participantId,
      age: caseData.customer.age,
      gender: caseData.customer.gender,
      diagnosis: caseData.customer.diagnosis,
    },
    answers: caseData.answers.map((a) => ({
      icfCode: a.icfCode,
      qualifier: a.qualifier,
      note: a.note,
    })),
    goals: summary?.goals ?? [],
    environment: {
      livingSituation: summary?.environment?.livingSituation ?? "",
      supportPersons: summary?.environment?.supportPersons ?? "",
    },
    aidSelections: caseData.aidSelections.map((s) => ({
      name: s.aidItem.name,
      note: s.note,
    })),
    generatedText: summary?.generatedText ?? {
      section1: "",
      section2: "",
      section3: "",
      section4: "",
      section5: "",
    },
    signaturePath: null as string | null,
  };

  if (type === "pdf") {
    // Resolve signature path if it exists
    if (caseData.signaturePath) {
      const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
      const sigFile = path.join(uploadDir, "signatures", `${caseId}.png`);
      try {
        await fs.access(sigFile);
        exportData.signaturePath = sigFile;
      } catch {
        // signature file not found, skip
      }
    }

    const buffer = await generatePdf(exportData);

    // Save to disk
    const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
    const docsDir = path.join(uploadDir, "documents");
    await fs.mkdir(docsDir, { recursive: true });
    const filePath = path.join(docsDir, `${caseId}.pdf`);
    await fs.writeFile(filePath, buffer);

    // Record in DB
    await prisma.generatedDocument.deleteMany({ where: { caseId, type: "pdf" } });
    await prisma.generatedDocument.create({ data: { caseId, type: "pdf", path: filePath } });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${caseData.caseNumber}.pdf"`,
      },
    });
  }

  if (type === "docx") {
    const buffer = await generateDocx(exportData);

    const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
    const docsDir = path.join(uploadDir, "documents");
    await fs.mkdir(docsDir, { recursive: true });
    const filePath = path.join(docsDir, `${caseId}.docx`);
    await fs.writeFile(filePath, buffer);

    await prisma.generatedDocument.deleteMany({ where: { caseId, type: "docx" } });
    await prisma.generatedDocument.create({ data: { caseId, type: "docx", path: filePath } });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${caseData.caseNumber}.docx"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid type. Use ?type=pdf or ?type=docx" }, { status: 400 });
}
