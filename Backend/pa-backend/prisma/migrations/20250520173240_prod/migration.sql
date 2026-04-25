-- CreateEnum
CREATE TYPE "userVisibility" AS ENUM ('all', 'team', 'self');

-- CreateEnum
CREATE TYPE "type" AS ENUM ('should_increase_to', 'should_decrease_to', 'should_stay_above', 'should_stay_below', 'achieve_or_not');

-- CreateEnum
CREATE TYPE "teamType" AS ENUM ('team', 'department');

-- CreateEnum
CREATE TYPE "cadence" AS ENUM ('one_month', 'three_month', 'six_month', 'one_year');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('active', 'pending', 'not_verified', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "employeeSize" AS ENUM ('size_1_25', 'size_25_100', 'size_100_200', 'size_200_500', 'size_500Plus');

-- CreateEnum
CREATE TYPE "orgUnit" AS ENUM ('human_resource', 'product', 'engineering', 'sales_and_business', 'design_and_creative');

-- CreateEnum
CREATE TYPE "industry" AS ENUM ('healthcare_industry', 'financial_services_industry', 'manufacturing_industry', 'retail_industry');

-- CreateEnum
CREATE TYPE "otpStatus" AS ENUM ('active', 'expired', 'used');

-- CreateEnum
CREATE TYPE "deadlineLevel" AS ENUM ('hard_deadline', 'soft_deadline');

-- CreateEnum
CREATE TYPE "objStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "scope" AS ENUM ('individual', 'team', 'wide');

-- CreateEnum
CREATE TYPE "templateType" AS ENUM ('checkIn', 'oneOnOne', 'performance');

-- CreateEnum
CREATE TYPE "questionType" AS ENUM ('descriptive', 'yesNo', 'rating', 'multipleChoice');

-- CreateEnum
CREATE TYPE "freuency" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'biweekly', 'halfyearly', 'yearly');

-- CreateEnum
CREATE TYPE "formStatus" AS ENUM ('pending', 'completed', 'expired', 'not_verified');

-- CreateEnum
CREATE TYPE "templateStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "projectStatus" AS ENUM ('active', 'inactive', 'completed');

-- CreateEnum
CREATE TYPE "taskStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "taskType" AS ENUM ('project', 'objective');

-- CreateEnum
CREATE TYPE "taskpriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "sectionType" AS ENUM ('Project', 'Objective');

-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdBy" TEXT,
    "topicId" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "score" INTEGER,
    "title" TEXT NOT NULL,
    "backgroundColour" TEXT NOT NULL,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadlineLevel" "deadlineLevel" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "deadlineDate" TIMESTAMP(3),
    "sessionId" TEXT NOT NULL,
    "progress" INTEGER DEFAULT 0,
    "scope" "scope" NOT NULL,
    "objStatus" "objStatus" NOT NULL,
    "frequencyUpdate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneCode" TEXT,
    "mobile" TEXT,
    "teamId" TEXT,
    "managerId" TEXT,
    "orgUnit" TEXT,
    "joiningDate" TIMESTAMP(3),
    "designation" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'not_verified',
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB,
    "role" TEXT,
    "departmentId" TEXT,
    "empId" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "dob" TIMESTAMP(3),
    "okrVisibility" "userVisibility" NOT NULL DEFAULT 'all',
    "checkInVisibility" "userVisibility" NOT NULL DEFAULT 'all',
    "oneOnOneVisibility" "userVisibility" NOT NULL DEFAULT 'all',
    "performanceVisibility" "userVisibility" NOT NULL DEFAULT 'all',
    "probationPeriodEnd" TIMESTAMP(3),
    "exitReason" TEXT,
    "probationPeriod" TEXT,
    "salary" TEXT,
    "salaryCurrency" TEXT,
    "linkedinURL" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keysResults" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "initialValue" INTEGER NOT NULL,
    "progress" INTEGER DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "kpiWeightage" DOUBLE PRECISION,
    "type" "type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keysResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownership" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cadence" "cadence" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keysResultsUpdates" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "updatedValue" INTEGER NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "note" TEXT,
    "proof" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keysResultsUpdates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "establishedDate" TIMESTAMP(3),
    "streetAddress" TEXT,
    "streetNo" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "zipCode" INTEGER,
    "identifier" TEXT,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vatNo" TEXT,
    "language" TEXT,
    "domain" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "okrType" TEXT,
    "billingEmail" TEXT,
    "contactPerson" TEXT,
    "logo" TEXT,
    "whitelabel" BOOLEAN DEFAULT false,
    "employeeSize" "employeeSize",
    "industry" "industry",

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "objectiveId" TEXT,
    "keyResultId" TEXT,
    "feedbackId" TEXT,
    "message" TEXT,
    "badgeTopicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "formresId" TEXT,
    "link" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "leadId" TEXT,
    "type" "teamType" NOT NULL,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpiUpdatesComments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "kpiUpdateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpiUpdatesComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpiUpdateLikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kpiUpdateId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "kpiUpdateLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpiUpdateCommentLikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "kpiUpdateCommentLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "viewerScope" "scope" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbackViewer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "viewerScope" "scope" NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewerTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbackViewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminAccess" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adminAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "otpValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "status" "otpStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passwordResetToken" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unused',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passwordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "sessionId" TEXT,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "agenda" TEXT,
    "showOkr" TEXT,
    "type" "templateType" NOT NULL,
    "status" "templateStatus" NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "managerStartDate" TIMESTAMP(3),
    "managerEndDate" TIMESTAMP(3),
    "selfScore" INTEGER NOT NULL DEFAULT 50,
    "endsIn" INTEGER,
    "isObjectiveIncluded" BOOLEAN DEFAULT false,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightage" INTEGER,
    "description" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "isPrivate" BOOLEAN NOT NULL,
    "type" "questionType" NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isAnswer" BOOLEAN NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templateViewer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "schedule" "freuency" NOT NULL,
    "lastRunDate" TIMESTAMP(3),

    CONSTRAINT "templateViewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templateInstance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "templateInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formResponse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "formResId" TEXT NOT NULL,
    "categoryId" TEXT,
    "questionId" TEXT NOT NULL,
    "textResponse" TEXT,
    "score" DOUBLE PRECISION,
    "yesNoResponse" TEXT,
    "ratingResponse" TEXT,
    "msqResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formRes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "isManager" BOOLEAN,
    "templateInstanceId" TEXT NOT NULL,
    "status" "formStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formRes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectTeam" (
    "projectId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "projectTeam_pkey" PRIMARY KEY ("projectId","teamId")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "status" "projectStatus" NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "projectDocs" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectUser" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "projectUser_pkey" PRIMARY KEY ("userId","projectId")
);

-- CreateTable
CREATE TABLE "section" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT,
    "objectiveId" TEXT,
    "name" TEXT NOT NULL,
    "type" "sectionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "taskStatus" NOT NULL DEFAULT 'pending',
    "priority" "taskpriority" NOT NULL DEFAULT 'low',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentTaskId" TEXT,
    "assignedTo" TEXT,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectiveTemplates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "banner" TEXT,
    "deadlineLevel" "deadlineLevel" NOT NULL,
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectiveTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyResultTemplate" (
    "id" TEXT NOT NULL,
    "objectiveTemplateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "initialValue" INTEGER NOT NULL,
    "progress" INTEGER DEFAULT 0,
    "unit" TEXT,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "type" "type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyResultTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templateDivisions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "templateType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templateDivisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predefinedTemplates" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "agenda" TEXT,
    "templateDivisionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predefinedTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predefinedCategories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "weightage" INTEGER,
    "description" TEXT NOT NULL,
    "predefinedTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predefinedCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predefinedQuestions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "questionText" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "isPrivate" BOOLEAN NOT NULL,
    "type" "questionType" NOT NULL,
    "predefinedCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predefinedQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predefinedOptions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "questionId" TEXT NOT NULL,
    "isAnswer" BOOLEAN NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predefinedOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_divisionToobjective" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_divisionToobjective_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_tenantId_idx" ON "user"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "company_domain_key" ON "company"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "company_website_key" ON "company"("website");

-- CreateIndex
CREATE UNIQUE INDEX "team_leadId_key" ON "team"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetToken_token_key" ON "passwordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "templates_id_key" ON "templates"("id");

-- CreateIndex
CREATE UNIQUE INDEX "section_projectId_objectiveId_key" ON "section"("projectId", "objectiveId");

-- CreateIndex
CREATE INDEX "task_sectionId_idx" ON "task"("sectionId");

-- CreateIndex
CREATE INDEX "_divisionToobjective_B_index" ON "_divisionToobjective"("B");

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective" ADD CONSTRAINT "objective_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective" ADD CONSTRAINT "objective_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective" ADD CONSTRAINT "objective_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective" ADD CONSTRAINT "objective_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keysResults" ADD CONSTRAINT "keysResults_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keysResults" ADD CONSTRAINT "keysResults_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership" ADD CONSTRAINT "ownership_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership" ADD CONSTRAINT "ownership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership" ADD CONSTRAINT "ownership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership" ADD CONSTRAINT "ownership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keysResultsUpdates" ADD CONSTRAINT "keysResultsUpdates_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "keysResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keysResultsUpdates" ADD CONSTRAINT "keysResultsUpdates_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keysResultsUpdates" ADD CONSTRAINT "keysResultsUpdates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "keysResults"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_badgeTopicId_fkey" FOREIGN KEY ("badgeTopicId") REFERENCES "topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdatesComments" ADD CONSTRAINT "kpiUpdatesComments_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdatesComments" ADD CONSTRAINT "kpiUpdatesComments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "kpiUpdatesComments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdatesComments" ADD CONSTRAINT "kpiUpdatesComments_kpiUpdateId_fkey" FOREIGN KEY ("kpiUpdateId") REFERENCES "keysResultsUpdates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdatesComments" ADD CONSTRAINT "kpiUpdatesComments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateLikes" ADD CONSTRAINT "kpiUpdateLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateLikes" ADD CONSTRAINT "kpiUpdateLikes_kpiUpdateId_fkey" FOREIGN KEY ("kpiUpdateId") REFERENCES "keysResultsUpdates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateLikes" ADD CONSTRAINT "kpiUpdateLikes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateCommentLikes" ADD CONSTRAINT "kpiUpdateCommentLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateCommentLikes" ADD CONSTRAINT "kpiUpdateCommentLikes_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "kpiUpdatesComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpiUpdateCommentLikes" ADD CONSTRAINT "kpiUpdateCommentLikes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_sentTo_fkey" FOREIGN KEY ("sentTo") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbackViewer" ADD CONSTRAINT "feedbackViewer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbackViewer" ADD CONSTRAINT "feedbackViewer_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbackViewer" ADD CONSTRAINT "feedbackViewer_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbackViewer" ADD CONSTRAINT "feedbackViewer_viewerTeam_fkey" FOREIGN KEY ("viewerTeam") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminAccess" ADD CONSTRAINT "adminAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminAccess" ADD CONSTRAINT "adminAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passwordResetToken" ADD CONSTRAINT "passwordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passwordResetToken" ADD CONSTRAINT "passwordResetToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateViewer" ADD CONSTRAINT "templateViewer_templateId_template_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateViewer" ADD CONSTRAINT "templateViewer_templateId_company_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateViewer" ADD CONSTRAINT "templateViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateViewer" ADD CONSTRAINT "templateViewer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateInstance" ADD CONSTRAINT "company_templateId_template_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateInstance" ADD CONSTRAINT "templateInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_yesNoResponse_fkey" FOREIGN KEY ("yesNoResponse") REFERENCES "options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_ratingResponse_fkey" FOREIGN KEY ("ratingResponse") REFERENCES "options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_formResId_fkey" FOREIGN KEY ("formResId") REFERENCES "formRes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_msqResponse_fkey" FOREIGN KEY ("msqResponse") REFERENCES "options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formResponse" ADD CONSTRAINT "formResponse_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formRes" ADD CONSTRAINT "formRes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formRes" ADD CONSTRAINT "formRes_templateInstanceId_fkey" FOREIGN KEY ("templateInstanceId") REFERENCES "templateInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formRes" ADD CONSTRAINT "formRes_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formRes" ADD CONSTRAINT "formRes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectTeam" ADD CONSTRAINT "projectTeam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectTeam" ADD CONSTRAINT "projectTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectUser" ADD CONSTRAINT "projectUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectUser" ADD CONSTRAINT "projectUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectiveTemplates" ADD CONSTRAINT "objectiveTemplates_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyResultTemplate" ADD CONSTRAINT "keyResultTemplate_objectiveTemplateId_fkey" FOREIGN KEY ("objectiveTemplateId") REFERENCES "objectiveTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predefinedTemplates" ADD CONSTRAINT "predefinedTemplates_templateDivisionId_fkey" FOREIGN KEY ("templateDivisionId") REFERENCES "templateDivisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predefinedCategories" ADD CONSTRAINT "predefinedCategories_predefinedTemplateId_fkey" FOREIGN KEY ("predefinedTemplateId") REFERENCES "predefinedTemplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predefinedQuestions" ADD CONSTRAINT "predefinedQuestions_predefinedCategoryId_fkey" FOREIGN KEY ("predefinedCategoryId") REFERENCES "predefinedCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predefinedOptions" ADD CONSTRAINT "predefinedOptions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "predefinedQuestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_divisionToobjective" ADD CONSTRAINT "_divisionToobjective_A_fkey" FOREIGN KEY ("A") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_divisionToobjective" ADD CONSTRAINT "_divisionToobjective_B_fkey" FOREIGN KEY ("B") REFERENCES "objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
