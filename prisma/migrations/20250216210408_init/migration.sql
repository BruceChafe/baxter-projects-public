-- CreateTable
CREATE TABLE "Roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerGroups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "country" TEXT,

    CONSTRAINT "DealerGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dealerships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealergroup_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "leadResponseTimeLimit" INTEGER NOT NULL DEFAULT 30,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT DEFAULT 'CAN',
    "phoneNumber" TEXT,
    "faxNumber" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,

    CONSTRAINT "Dealerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealershipHours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealership_id" UUID NOT NULL,
    "day" TEXT NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,

    CONSTRAINT "DealershipHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT auth.uid(),
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealergroup_id" UUID,
    "role_id" UUID,
    "primary_dealership_id" UUID,
    "job_title_id" UUID,
    "department_id" UUID,
    "dealerships" JSONB[],

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "isUniversal" BOOLEAN NOT NULL DEFAULT false,
    "dealergroup_id" UUID,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTitles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "isUniversal" BOOLEAN NOT NULL DEFAULT false,
    "dealergroup_id" UUID,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTitles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriversLicenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "dealership_id" UUID NOT NULL,
    "dealergroup_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middleName" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "address" TEXT,
    "expirationDate" TIMESTAMP(3),
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "dateOfIssue" TIMESTAMP(3),
    "endorsements" TEXT,
    "restrictions" TEXT,
    "country" TEXT DEFAULT 'CAN',
    "dateProcessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "scannedByUserId" UUID,
    "scannedAt" TIMESTAMP(3),

    CONSTRAINT "DriversLicenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "driversLicenseId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "dealership_id" UUID,
    "dealergroup_id" UUID,
    "driversLicenseId" UUID,
    "contact_id" UUID,
    "salesConsultant" TEXT,
    "vehicleOfInterest" TEXT,
    "salesType" TEXT,
    "notes" TEXT,
    "visitReason" TEXT,
    "dateOfVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealership_id" UUID,
    "dealergroup_id" UUID,
    "dms_number" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "preferred_language" TEXT,
    "preferred_contact" JSONB NOT NULL,
    "primary_email" TEXT NOT NULL,
    "secondary_email" TEXT,
    "mobile_phone" TEXT NOT NULL,
    "home_phone" TEXT,
    "work_phone" TEXT,
    "street_address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "last_visit" TIMESTAMP(3),
    "total_visits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanRecords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact_id" UUID NOT NULL,
    "dealership_id" UUID NOT NULL,
    "dealergroup_id" UUID,
    "bannedById" UUID NOT NULL,
    "banReason" TEXT NOT NULL,
    "banNotes" TEXT,
    "dateBanned" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLifted" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BanRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'To Do',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact_id" UUID,
    "dealership_id" UUID,
    "dealergroup_id" UUID,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" TEXT,
    "budget" TEXT,
    "leadSource" TEXT NOT NULL,
    "leadStatus" TEXT NOT NULL,
    "leadType" TEXT,
    "leadMedia" TEXT,
    "leadPriority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" UUID,
    "vin" TEXT,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "isQueued" BOOLEAN NOT NULL DEFAULT true,
    "claimedBy" UUID,
    "claimedAt" TIMESTAMP(3),
    "tradeIn" TEXT,
    "tradeInDetails" TEXT,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "LeadActivities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnattendedLeads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "dealergroup_id" UUID,
    "dealership_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UnattendedLeads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DealershipDepartments" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_JobTitleDealerships" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DealerGroups_name_key" ON "DealerGroups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Dealerships_name_key" ON "Dealerships"("name");

-- CreateIndex
CREATE INDEX "Dealerships_dealerGroupId_dateCreated_idx" ON "Dealerships"("dealergroup_id", "dateCreated");

-- CreateIndex
CREATE UNIQUE INDEX "DealershipHours_dealershipId_day_key" ON "DealershipHours"("dealership_id", "day");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_last_name_first_name_idx" ON "Users"("last_name", "first_name");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_name_key" ON "Departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobTitles_title_department_id_key" ON "JobTitles"("title", "department_id");

-- CreateIndex
CREATE INDEX "DriversLicenses_last_name_first_name_idx" ON "DriversLicenses"("last_name", "first_name");

-- CreateIndex
CREATE UNIQUE INDEX "DriversLicenses_licenseNumber_dealershipId_key" ON "DriversLicenses"("licenseNumber", "dealership_id");

-- CreateIndex
CREATE INDEX "Visits_dateOfVisit_idx" ON "Visits"("dateOfVisit");

-- CreateIndex
CREATE INDEX "BanRecords_contact_id_isActive_idx" ON "BanRecords"("contact_id", "isActive");

-- CreateIndex
CREATE INDEX "BanRecords_dealerGroupId_dealershipId_idx" ON "BanRecords"("dealergroup_id", "dealership_id");

-- CreateIndex
CREATE INDEX "LeadTasks_status_priority_idx" ON "LeadTasks"("status", "priority");

-- CreateIndex
CREATE INDEX "LeadActivities_leadId_created_at_idx" ON "LeadActivities"("leadId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UnattendedLeads_leadId_key" ON "UnattendedLeads"("leadId");

-- CreateIndex
CREATE INDEX "UnattendedLeads_dealerGroupId_created_at_idx" ON "UnattendedLeads"("dealergroup_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_roleId_key" ON "UserRoles"("userId", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "_DealershipDepartments_AB_unique" ON "_DealershipDepartments"("A", "B");

-- CreateIndex
CREATE INDEX "_DealershipDepartments_B_index" ON "_DealershipDepartments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JobTitleDealerships_AB_unique" ON "_JobTitleDealerships"("A", "B");

-- CreateIndex
CREATE INDEX "_JobTitleDealerships_B_index" ON "_JobTitleDealerships"("B");

-- AddForeignKey
ALTER TABLE "Dealerships" ADD CONSTRAINT "Dealerships_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealershipHours" ADD CONSTRAINT "DealershipHours_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "JobTitles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_primary_dealership_id_fkey" FOREIGN KEY ("primary_dealership_id") REFERENCES "Dealerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTitles" ADD CONSTRAINT "JobTitles_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTitles" ADD CONSTRAINT "JobTitles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversLicenses" ADD CONSTRAINT "DriversLicenses_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversLicenses" ADD CONSTRAINT "DriversLicenses_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversLicenses" ADD CONSTRAINT "DriversLicenses_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversLicenses" ADD CONSTRAINT "DriversLicenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNotes" ADD CONSTRAINT "CustomerNotes_driversLicenseId_fkey" FOREIGN KEY ("driversLicenseId") REFERENCES "DriversLicenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNotes" ADD CONSTRAINT "CustomerNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_driversLicenseId_fkey" FOREIGN KEY ("driversLicenseId") REFERENCES "DriversLicenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRecords" ADD CONSTRAINT "BanRecords_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRecords" ADD CONSTRAINT "BanRecords_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRecords" ADD CONSTRAINT "BanRecords_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTasks" ADD CONSTRAINT "LeadTasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_claimedBy_fkey" FOREIGN KEY ("claimedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivities" ADD CONSTRAINT "LeadActivities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivities" ADD CONSTRAINT "LeadActivities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnattendedLeads" ADD CONSTRAINT "UnattendedLeads_dealerGroupId_fkey" FOREIGN KEY ("dealergroup_id") REFERENCES "DealerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnattendedLeads" ADD CONSTRAINT "UnattendedLeads_dealershipId_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnattendedLeads" ADD CONSTRAINT "UnattendedLeads_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealershipDepartments" ADD CONSTRAINT "_DealershipDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealershipDepartments" ADD CONSTRAINT "_DealershipDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "Departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobTitleDealerships" ADD CONSTRAINT "_JobTitleDealerships_A_fkey" FOREIGN KEY ("A") REFERENCES "Dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobTitleDealerships" ADD CONSTRAINT "_JobTitleDealerships_B_fkey" FOREIGN KEY ("B") REFERENCES "JobTitles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
