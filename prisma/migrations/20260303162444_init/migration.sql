-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Boss" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "diagnosis" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "signaturePath" TEXT,
    "aidWishMissing" TEXT,
    "aidWishHave" TEXT,
    "aidWishWant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAnswer" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "icfCode" TEXT NOT NULL,
    "qualifier" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "CaseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSummary" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "goals" JSONB NOT NULL,
    "environment" JSONB NOT NULL,
    "generatedText" JSONB NOT NULL,

    CONSTRAINT "CaseSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidSelection" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "aidItemId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "AidSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanupRun" (
    "id" TEXT NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedCustomers" INTEGER NOT NULL,
    "errors" TEXT,

    CONSTRAINT "CleanupRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WizardSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "stepData" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WizardSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Boss_email_key" ON "Boss"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_referralCode_key" ON "Admin"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_participantId_key" ON "Customer"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSummary_caseId_key" ON "CaseSummary"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "WizardSession_token_key" ON "WizardSession"("token");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAnswer" ADD CONSTRAINT "CaseAnswer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSummary" ADD CONSTRAINT "CaseSummary_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidSelection" ADD CONSTRAINT "AidSelection_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidSelection" ADD CONSTRAINT "AidSelection_aidItemId_fkey" FOREIGN KEY ("aidItemId") REFERENCES "AidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
