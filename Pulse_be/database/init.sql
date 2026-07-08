CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "AnalyticsSnapshots" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "MetricType" text NOT NULL,
        "Data" text NOT NULL,
        "SnapshotDate" date NOT NULL,
        "Period" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AnalyticsSnapshots" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Permissions" (
        "Id" uuid NOT NULL,
        "Module" text NOT NULL,
        "Action" text NOT NULL,
        "Resource" text NOT NULL,
        "Description" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Permissions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Roles" (
        "Id" uuid NOT NULL,
        "Name" character varying(50) NOT NULL,
        "Description" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Users" (
        "Id" uuid NOT NULL,
        "Email" character varying(256) NOT NULL,
        "PasswordHash" text,
        "FirstName" character varying(100) NOT NULL,
        "LastName" character varying(100) NOT NULL,
        "AvatarUrl" text,
        "Provider" integer NOT NULL,
        "ProviderId" text,
        "EmailConfirmed" boolean NOT NULL,
        "LastLoginAt" timestamp with time zone,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "RolePermissions" (
        "RoleId" uuid NOT NULL,
        "PermissionId" uuid NOT NULL,
        CONSTRAINT "PK_RolePermissions" PRIMARY KEY ("RoleId", "PermissionId"),
        CONSTRAINT "FK_RolePermissions_Permissions_PermissionId" FOREIGN KEY ("PermissionId") REFERENCES "Permissions" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_RolePermissions_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "ActivityLogs" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "ActorId" uuid NOT NULL,
        "EntityType" text NOT NULL,
        "EntityId" uuid NOT NULL,
        "Action" text NOT NULL,
        "OldValues" text,
        "NewValues" text,
        "Description" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ActivityLogs" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ActivityLogs_Users_ActorId" FOREIGN KEY ("ActorId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "AIConversations" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Context" text NOT NULL,
        "ContextEntityId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AIConversations" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AIConversations_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "CalendarEvents" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "GoogleEventId" text,
        "Title" text NOT NULL,
        "Description" text,
        "StartTime" timestamp with time zone NOT NULL,
        "EndTime" timestamp with time zone NOT NULL,
        "IsAllDay" boolean NOT NULL,
        "Location" text,
        "Source" integer NOT NULL,
        "Status" integer NOT NULL,
        "Attendees" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_CalendarEvents" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CalendarEvents_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "DashboardWidgets" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "WidgetType" integer NOT NULL,
        "Config" text,
        "PositionX" integer NOT NULL,
        "PositionY" integer NOT NULL,
        "Width" integer NOT NULL,
        "Height" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_DashboardWidgets" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_DashboardWidgets_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "GoogleCalendarConnections" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "AccessToken" text NOT NULL,
        "RefreshToken" text NOT NULL,
        "CalendarId" text,
        "SyncToken" text,
        "SyncEnabled" boolean NOT NULL,
        "LastSyncAt" timestamp with time zone,
        "TokenExpiresAt" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_GoogleCalendarConnections" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_GoogleCalendarConnections_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Notifications" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Type" integer NOT NULL,
        "Title" text NOT NULL,
        "Content" text,
        "EntityType" text,
        "EntityId" uuid,
        "ActorId" uuid,
        "Channel" integer NOT NULL,
        "IsRead" boolean NOT NULL,
        "ReadAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Notifications_Users_ActorId" FOREIGN KEY ("ActorId") REFERENCES "Users" ("Id"),
        CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Objectives" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "ParentObjectiveId" uuid,
        "OwnerId" uuid NOT NULL,
        "Title" text NOT NULL,
        "Description" text,
        "Period" text,
        "Status" integer NOT NULL,
        "Progress" numeric(5,2) NOT NULL,
        "StartDate" timestamp with time zone,
        "EndDate" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedById" uuid,
        "UpdatedById" uuid,
        CONSTRAINT "PK_Objectives" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Objectives_Objectives_ParentObjectiveId" FOREIGN KEY ("ParentObjectiveId") REFERENCES "Objectives" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_Objectives_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "PasswordResetTokens" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Token" text NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "IsUsed" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_PasswordResetTokens" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PasswordResetTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "RefreshTokens" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Token" text NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "CreatedByIp" text,
        "RevokedAt" timestamp with time zone,
        "RevokedByIp" text,
        "ReplacedByToken" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "UserProfiles" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "JobTitle" text,
        "Department" text,
        "Phone" text,
        "Timezone" text,
        "Bio" text,
        "Skills" jsonb NOT NULL,
        "SocialLinks" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_UserProfiles" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_UserProfiles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "WorkloadSummaries" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "PeriodDate" date NOT NULL,
        "TotalTasks" integer NOT NULL,
        "CompletedTasks" integer NOT NULL,
        "OverdueTasks" integer NOT NULL,
        "TotalMinutesTracked" integer NOT NULL,
        "EstimatedMinutesRemaining" integer NOT NULL,
        "CompletionRate" numeric(5,2) NOT NULL,
        "CalculatedAt" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_WorkloadSummaries" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_WorkloadSummaries_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Workspaces" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Slug" character varying(100) NOT NULL,
        "LogoUrl" text,
        "Description" text,
        "OwnerId" uuid NOT NULL,
        "Plan" integer NOT NULL,
        "DeletedAt" timestamp with time zone,
        "IsDeleted" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedById" uuid,
        "UpdatedById" uuid,
        CONSTRAINT "PK_Workspaces" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Workspaces_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "AIActionLogs" (
        "Id" uuid NOT NULL,
        "ConversationId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "ActionType" text NOT NULL,
        "ActionPayload" text,
        "ActionResult" text,
        "Status" integer NOT NULL,
        "ExecutedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AIActionLogs" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AIActionLogs_AIConversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES "AIConversations" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_AIActionLogs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "AIMessages" (
        "Id" uuid NOT NULL,
        "ConversationId" uuid NOT NULL,
        "Role" integer NOT NULL,
        "Content" text NOT NULL,
        "ToolCalls" text,
        "TokensUsed" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AIMessages" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AIMessages_AIConversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES "AIConversations" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Meetings" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "OrganizerId" uuid NOT NULL,
        "Title" text NOT NULL,
        "Description" text,
        "Agenda" text,
        "ProposedStartTime" timestamp with time zone NOT NULL,
        "ProposedEndTime" timestamp with time zone NOT NULL,
        "Status" integer NOT NULL,
        "CalendarEventId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Meetings" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Meetings_CalendarEvents_CalendarEventId" FOREIGN KEY ("CalendarEventId") REFERENCES "CalendarEvents" ("Id"),
        CONSTRAINT "FK_Meetings_Users_OrganizerId" FOREIGN KEY ("OrganizerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "KeyResults" (
        "Id" uuid NOT NULL,
        "ObjectiveId" uuid NOT NULL,
        "OwnerId" uuid NOT NULL,
        "Title" text NOT NULL,
        "MetricType" integer NOT NULL,
        "StartValue" numeric(18,4) NOT NULL,
        "TargetValue" numeric(18,4) NOT NULL,
        "CurrentValue" numeric(18,4) NOT NULL,
        "Unit" text,
        "Progress" numeric(5,2) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_KeyResults" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_KeyResults_Objectives_ObjectiveId" FOREIGN KEY ("ObjectiveId") REFERENCES "Objectives" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_KeyResults_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "ChatChannels" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Type" integer NOT NULL,
        "Name" text,
        "TaskId" uuid,
        "CreatedById" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ChatChannels" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ChatChannels_Users_CreatedById" FOREIGN KEY ("CreatedById") REFERENCES "Users" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_ChatChannels_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Invitations" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Email" character varying(256) NOT NULL,
        "RoleId" uuid NOT NULL,
        "InvitedById" uuid NOT NULL,
        "Token" text NOT NULL,
        "Status" integer NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "AcceptedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Invitations" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Invitations_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Invitations_Users_InvitedById" FOREIGN KEY ("InvitedById") REFERENCES "Users" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Invitations_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Projects" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" text,
        "Color" text,
        "Icon" text,
        "Status" integer NOT NULL,
        "StartDate" timestamp with time zone,
        "EndDate" timestamp with time zone,
        "DeletedAt" timestamp with time zone,
        "IsDeleted" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedById" uuid,
        "UpdatedById" uuid,
        CONSTRAINT "PK_Projects" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Projects_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Teams" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "Description" text,
        "Color" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedById" uuid,
        "UpdatedById" uuid,
        CONSTRAINT "PK_Teams" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Teams_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "UserWorkspaceRoles" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "RoleId" uuid NOT NULL,
        "AssignedAt" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_UserWorkspaceRoles" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_UserWorkspaceRoles_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_UserWorkspaceRoles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_UserWorkspaceRoles_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "MeetingParticipants" (
        "Id" uuid NOT NULL,
        "MeetingId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "ResponseStatus" integer NOT NULL,
        "RespondedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_MeetingParticipants" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_MeetingParticipants_Meetings_MeetingId" FOREIGN KEY ("MeetingId") REFERENCES "Meetings" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_MeetingParticipants_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "OKRCheckIns" (
        "Id" uuid NOT NULL,
        "KeyResultId" uuid NOT NULL,
        "AuthorId" uuid NOT NULL,
        "PreviousValue" numeric(18,4) NOT NULL,
        "NewValue" numeric(18,4) NOT NULL,
        "Note" text,
        "Confidence" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_OKRCheckIns" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_OKRCheckIns_KeyResults_KeyResultId" FOREIGN KEY ("KeyResultId") REFERENCES "KeyResults" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_OKRCheckIns_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "ChatChannelMembers" (
        "ChannelId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "JoinedAt" timestamp with time zone NOT NULL,
        "LastReadAt" timestamp with time zone,
        "IsMuted" boolean NOT NULL,
        CONSTRAINT "PK_ChatChannelMembers" PRIMARY KEY ("ChannelId", "UserId"),
        CONSTRAINT "FK_ChatChannelMembers_ChatChannels_ChannelId" FOREIGN KEY ("ChannelId") REFERENCES "ChatChannels" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_ChatChannelMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "ChatMessages" (
        "Id" uuid NOT NULL,
        "ChannelId" uuid NOT NULL,
        "SenderId" uuid NOT NULL,
        "Content" text NOT NULL,
        "Type" integer NOT NULL,
        "ReplyToId" uuid,
        "IsEdited" boolean NOT NULL,
        "DeletedAt" timestamp with time zone,
        "IsDeleted" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ChatMessages" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ChatMessages_ChatChannels_ChannelId" FOREIGN KEY ("ChannelId") REFERENCES "ChatChannels" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_ChatMessages_ChatMessages_ReplyToId" FOREIGN KEY ("ReplyToId") REFERENCES "ChatMessages" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_ChatMessages_Users_SenderId" FOREIGN KEY ("SenderId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskLabels" (
        "Id" uuid NOT NULL,
        "ProjectId" uuid NOT NULL,
        "Name" text NOT NULL,
        "Color" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskLabels" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskLabels_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "Tasks" (
        "Id" uuid NOT NULL,
        "ProjectId" uuid NOT NULL,
        "ParentTaskId" uuid,
        "Title" character varying(500) NOT NULL,
        "Description" text,
        "Status" integer NOT NULL,
        "Priority" integer NOT NULL,
        "AssigneeId" uuid,
        "Deadline" timestamp with time zone,
        "StartDate" timestamp with time zone,
        "Position" integer NOT NULL,
        "EstimatedMinutes" integer,
        "ActualMinutes" integer,
        "CompletedAt" timestamp with time zone,
        "DeletedAt" timestamp with time zone,
        "IsDeleted" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedById" uuid,
        "UpdatedById" uuid,
        CONSTRAINT "PK_Tasks" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Tasks_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Tasks_Tasks_ParentTaskId" FOREIGN KEY ("ParentTaskId") REFERENCES "Tasks" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_Tasks_Users_AssigneeId" FOREIGN KEY ("AssigneeId") REFERENCES "Users" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TeamMembers" (
        "Id" uuid NOT NULL,
        "TeamId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Role" text NOT NULL,
        "JoinedAt" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TeamMembers" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TeamMembers_Teams_TeamId" FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TeamMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "KeyResultTaskLinks" (
        "Id" uuid NOT NULL,
        "KeyResultId" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "WeightPercent" numeric NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_KeyResultTaskLinks" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_KeyResultTaskLinks_KeyResults_KeyResultId" FOREIGN KEY ("KeyResultId") REFERENCES "KeyResults" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_KeyResultTaskLinks_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "PlannerBlocks" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "TaskId" uuid,
        "Title" text,
        "StartTime" timestamp with time zone NOT NULL,
        "EndTime" timestamp with time zone NOT NULL,
        "Type" integer NOT NULL,
        "RecurrencePattern" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_PlannerBlocks" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PlannerBlocks_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id"),
        CONSTRAINT "FK_PlannerBlocks_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskAttachments" (
        "Id" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "UploadedById" uuid NOT NULL,
        "FileName" text NOT NULL,
        "FileUrl" text NOT NULL,
        "FileType" text,
        "FileSize" bigint NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskAttachments" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskAttachments_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskAttachments_Users_UploadedById" FOREIGN KEY ("UploadedById") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskChecklists" (
        "Id" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "Title" text NOT NULL,
        "Position" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskChecklists" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskChecklists_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskComments" (
        "Id" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "AuthorId" uuid NOT NULL,
        "Content" text NOT NULL,
        "ParentCommentId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskComments" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskComments_TaskComments_ParentCommentId" FOREIGN KEY ("ParentCommentId") REFERENCES "TaskComments" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_TaskComments_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskComments_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskDependencies" (
        "Id" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "DependsOnTaskId" uuid NOT NULL,
        "Type" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskDependencies" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskDependencies_Tasks_DependsOnTaskId" FOREIGN KEY ("DependsOnTaskId") REFERENCES "Tasks" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_TaskDependencies_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskFollowers" (
        "TaskId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "FollowedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskFollowers" PRIMARY KEY ("TaskId", "UserId"),
        CONSTRAINT "FK_TaskFollowers_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskFollowers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TaskLabelAssignments" (
        "TaskId" uuid NOT NULL,
        "LabelId" uuid NOT NULL,
        CONSTRAINT "PK_TaskLabelAssignments" PRIMARY KEY ("TaskId", "LabelId"),
        CONSTRAINT "FK_TaskLabelAssignments_TaskLabels_LabelId" FOREIGN KEY ("LabelId") REFERENCES "TaskLabels" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskLabelAssignments_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "TimeEntries" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "TaskId" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "StartTime" timestamp with time zone NOT NULL,
        "EndTime" timestamp with time zone,
        "DurationMinutes" integer,
        "Note" text,
        "IsRunning" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TimeEntries" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TimeEntries_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TimeEntries_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE TABLE "ChecklistItems" (
        "Id" uuid NOT NULL,
        "ChecklistId" uuid NOT NULL,
        "Content" text NOT NULL,
        "IsCompleted" boolean NOT NULL,
        "AssigneeId" uuid,
        "Position" integer NOT NULL,
        "CompletedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ChecklistItems" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ChecklistItems_TaskChecklists_ChecklistId" FOREIGN KEY ("ChecklistId") REFERENCES "TaskChecklists" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_ChecklistItems_Users_AssigneeId" FOREIGN KEY ("AssigneeId") REFERENCES "Users" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    INSERT INTO "Roles" ("Id", "CreatedAt", "Description", "Name", "UpdatedAt")
    VALUES ('a1b2c3d4-0001-0001-0001-000000000001', TIMESTAMPTZ '2026-03-10T01:49:13.259223Z', 'Full system access', 'Admin', TIMESTAMPTZ '2026-03-10T01:49:13.259224Z');
    INSERT INTO "Roles" ("Id", "CreatedAt", "Description", "Name", "UpdatedAt")
    VALUES ('a1b2c3d4-0001-0001-0001-000000000002', TIMESTAMPTZ '2026-03-10T01:49:13.259463Z', 'Team and project management', 'Manager', TIMESTAMPTZ '2026-03-10T01:49:13.259463Z');
    INSERT INTO "Roles" ("Id", "CreatedAt", "Description", "Name", "UpdatedAt")
    VALUES ('a1b2c3d4-0001-0001-0001-000000000003', TIMESTAMPTZ '2026-03-10T01:49:13.259466Z', 'Standard workspace member', 'Staff', TIMESTAMPTZ '2026-03-10T01:49:13.259466Z');
    INSERT INTO "Roles" ("Id", "CreatedAt", "Description", "Name", "UpdatedAt")
    VALUES ('a1b2c3d4-0001-0001-0001-000000000004', TIMESTAMPTZ '2026-03-10T01:49:13.259467Z', 'Limited read access', 'Guest', TIMESTAMPTZ '2026-03-10T01:49:13.259467Z');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ActivityLogs_ActorId" ON "ActivityLogs" ("ActorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_AIActionLogs_ConversationId" ON "AIActionLogs" ("ConversationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_AIActionLogs_UserId" ON "AIActionLogs" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_AIConversations_UserId" ON "AIConversations" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_AIMessages_ConversationId" ON "AIMessages" ("ConversationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_CalendarEvents_UserId" ON "CalendarEvents" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatChannelMembers_UserId" ON "ChatChannelMembers" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatChannels_CreatedById" ON "ChatChannels" ("CreatedById");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatChannels_WorkspaceId" ON "ChatChannels" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatMessages_ChannelId" ON "ChatMessages" ("ChannelId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatMessages_ReplyToId" ON "ChatMessages" ("ReplyToId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChatMessages_SenderId" ON "ChatMessages" ("SenderId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChecklistItems_AssigneeId" ON "ChecklistItems" ("AssigneeId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_ChecklistItems_ChecklistId" ON "ChecklistItems" ("ChecklistId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_DashboardWidgets_UserId" ON "DashboardWidgets" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_GoogleCalendarConnections_UserId" ON "GoogleCalendarConnections" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Invitations_InvitedById" ON "Invitations" ("InvitedById");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Invitations_RoleId" ON "Invitations" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Invitations_Token" ON "Invitations" ("Token");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Invitations_WorkspaceId" ON "Invitations" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_KeyResults_ObjectiveId" ON "KeyResults" ("ObjectiveId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_KeyResults_OwnerId" ON "KeyResults" ("OwnerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_KeyResultTaskLinks_KeyResultId" ON "KeyResultTaskLinks" ("KeyResultId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_KeyResultTaskLinks_TaskId" ON "KeyResultTaskLinks" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_MeetingParticipants_MeetingId" ON "MeetingParticipants" ("MeetingId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_MeetingParticipants_UserId" ON "MeetingParticipants" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Meetings_CalendarEventId" ON "Meetings" ("CalendarEventId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Meetings_OrganizerId" ON "Meetings" ("OrganizerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Notifications_ActorId" ON "Notifications" ("ActorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Notifications_UserId" ON "Notifications" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Objectives_OwnerId" ON "Objectives" ("OwnerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Objectives_ParentObjectiveId" ON "Objectives" ("ParentObjectiveId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_OKRCheckIns_AuthorId" ON "OKRCheckIns" ("AuthorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_OKRCheckIns_KeyResultId" ON "OKRCheckIns" ("KeyResultId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_PasswordResetTokens_Token" ON "PasswordResetTokens" ("Token");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_PasswordResetTokens_UserId" ON "PasswordResetTokens" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_PlannerBlocks_TaskId" ON "PlannerBlocks" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_PlannerBlocks_UserId" ON "PlannerBlocks" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Projects_WorkspaceId" ON "Projects" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_RefreshTokens_Token" ON "RefreshTokens" ("Token");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_RolePermissions_PermissionId" ON "RolePermissions" ("PermissionId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Roles_Name" ON "Roles" ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskAttachments_TaskId" ON "TaskAttachments" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskAttachments_UploadedById" ON "TaskAttachments" ("UploadedById");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskChecklists_TaskId" ON "TaskChecklists" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskComments_AuthorId" ON "TaskComments" ("AuthorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskComments_ParentCommentId" ON "TaskComments" ("ParentCommentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskComments_TaskId" ON "TaskComments" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskDependencies_DependsOnTaskId" ON "TaskDependencies" ("DependsOnTaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskDependencies_TaskId" ON "TaskDependencies" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskFollowers_UserId" ON "TaskFollowers" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskLabelAssignments_LabelId" ON "TaskLabelAssignments" ("LabelId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TaskLabels_ProjectId" ON "TaskLabels" ("ProjectId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_AssigneeId" ON "Tasks" ("AssigneeId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_ParentTaskId" ON "Tasks" ("ParentTaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_ProjectId" ON "Tasks" ("ProjectId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_TeamMembers_TeamId_UserId" ON "TeamMembers" ("TeamId", "UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TeamMembers_UserId" ON "TeamMembers" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Teams_WorkspaceId" ON "Teams" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TimeEntries_TaskId" ON "TimeEntries" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_TimeEntries_UserId" ON "TimeEntries" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_UserProfiles_UserId" ON "UserProfiles" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_UserWorkspaceRoles_RoleId" ON "UserWorkspaceRoles" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_UserWorkspaceRoles_UserId_WorkspaceId_RoleId" ON "UserWorkspaceRoles" ("UserId", "WorkspaceId", "RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_UserWorkspaceRoles_WorkspaceId" ON "UserWorkspaceRoles" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_WorkloadSummaries_UserId" ON "WorkloadSummaries" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE INDEX "IX_Workspaces_OwnerId" ON "Workspaces" ("OwnerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Workspaces_Slug" ON "Workspaces" ("Slug");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260310014915_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260310014915_InitialCreate', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    ALTER TABLE "Roles" ADD "IsSystem" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    ALTER TABLE "Roles" ADD "WorkspaceId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0001-0001-0001-000000000001', 'manage', TIMESTAMPTZ '2026-03-11T01:47:50.211094Z', 'Full workspace management', 'workspace', 'workspace', TIMESTAMPTZ '2026-03-11T01:47:50.211094Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0001-0001-0001-000000000002', 'invite_member', TIMESTAMPTZ '2026-03-11T01:47:50.21115Z', 'Invite members to workspace', 'workspace', 'workspace', TIMESTAMPTZ '2026-03-11T01:47:50.21115Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0001-0001-0001-000000000003', 'remove_member', TIMESTAMPTZ '2026-03-11T01:47:50.211151Z', 'Remove members from workspace', 'workspace', 'workspace', TIMESTAMPTZ '2026-03-11T01:47:50.211151Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0002-0001-0001-000000000001', 'create', TIMESTAMPTZ '2026-03-11T01:47:50.211151Z', 'Create projects', 'project', 'project', TIMESTAMPTZ '2026-03-11T01:47:50.211151Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0002-0001-0001-000000000002', 'view', TIMESTAMPTZ '2026-03-11T01:47:50.211152Z', 'View projects', 'project', 'project', TIMESTAMPTZ '2026-03-11T01:47:50.211152Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0002-0001-0001-000000000003', 'edit', TIMESTAMPTZ '2026-03-11T01:47:50.211152Z', 'Edit projects', 'project', 'project', TIMESTAMPTZ '2026-03-11T01:47:50.211152Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0002-0001-0001-000000000004', 'delete', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z', 'Delete projects', 'project', 'project', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0002-0001-0001-000000000005', 'manage_members', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z', 'Manage project members', 'project', 'project', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000001', 'create', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z', 'Create tasks', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.211159Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000002', 'view', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z', 'View tasks', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000003', 'edit', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z', 'Edit tasks', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000004', 'delete', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z', 'Delete tasks', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.21116Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000005', 'assign', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z', 'Assign tasks to members', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0003-0001-0001-000000000006', 'change_status', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z', 'Change task status', 'task', 'task', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0004-0001-0001-000000000001', 'create', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z', 'Create teams', 'team', 'team', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0004-0001-0001-000000000002', 'view', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z', 'View teams', 'team', 'team', TIMESTAMPTZ '2026-03-11T01:47:50.211161Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0004-0001-0001-000000000003', 'edit', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z', 'Edit teams', 'team', 'team', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0004-0001-0001-000000000004', 'delete', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z', 'Delete teams', 'team', 'team', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0005-0001-0001-000000000001', 'create', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z', 'Create custom roles', 'role', 'role', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0005-0001-0001-000000000002', 'view', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z', 'View roles', 'role', 'role', TIMESTAMPTZ '2026-03-11T01:47:50.211162Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0005-0001-0001-000000000003', 'edit', TIMESTAMPTZ '2026-03-11T01:47:50.211163Z', 'Edit roles', 'role', 'role', TIMESTAMPTZ '2026-03-11T01:47:50.211163Z');
    INSERT INTO "Permissions" ("Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt")
    VALUES ('f0000000-0005-0001-0001-000000000004', 'delete', TIMESTAMPTZ '2026-03-11T01:47:50.211163Z', 'Delete roles', 'role', 'role', TIMESTAMPTZ '2026-03-11T01:47:50.211163Z');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210478Z', "IsSystem" = TRUE, "UpdatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210479Z', "WorkspaceId" = NULL
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210557Z', "IsSystem" = TRUE, "UpdatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210557Z', "WorkspaceId" = NULL
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210557Z', "IsSystem" = TRUE, "UpdatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210558Z', "WorkspaceId" = NULL
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210558Z', "IsSystem" = TRUE, "UpdatedAt" = TIMESTAMPTZ '2026-03-11T01:47:50.210558Z', "WorkspaceId" = NULL
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0002-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000004');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0003-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000004');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0004-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000004');
    INSERT INTO "RolePermissions" ("PermissionId", "RoleId")
    VALUES ('f0000000-0005-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000004');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    CREATE INDEX "IX_Roles_WorkspaceId" ON "Roles" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    ALTER TABLE "Roles" ADD CONSTRAINT "FK_Roles_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260311014751_AddCustomRoleSystem') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260311014751_AddCustomRoleSystem', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    ALTER TABLE "Tasks" DROP CONSTRAINT "FK_Tasks_Users_AssigneeId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    DROP INDEX "IX_Tasks_AssigneeId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    ALTER TABLE "Tasks" DROP COLUMN "AssigneeId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    CREATE TABLE "TaskAssignees" (
        "TaskId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "AssignedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_TaskAssignees" PRIMARY KEY ("TaskId", "UserId"),
        CONSTRAINT "FK_TaskAssignees_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskAssignees_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232552Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232552Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232623Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232623Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232623Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232623Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232624Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232625Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232626Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232627Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232628Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.231966Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.231967Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.23204Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.23204Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232041Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232041Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232041Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T19:24:22.232041Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    CREATE INDEX "IX_TaskAssignees_UserId" ON "TaskAssignees" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312192423_AddTaskAssignees') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260312192423_AddTaskAssignees', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    ALTER TABLE "ChatChannelMembers" ADD "HiddenAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855955Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855956Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856012Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856012Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856013Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856014Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856014Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856014Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856014Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856015Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856015Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856015Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856016Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856017Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856018Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856019Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856019Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.856019Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855344Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855344Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.85542Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.85542Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855421Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855421Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855422Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-12T22:13:51.855422Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260312221352_AddHiddenAtToChatMember') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260312221352_AddHiddenAtToChatMember', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    ALTER TABLE "ChatMessages" ADD "AttachmentName" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    ALTER TABLE "ChatMessages" ADD "AttachmentType" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    ALTER TABLE "ChatMessages" ADD "AttachmentUrl" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275674Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275674Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275735Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275735Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275735Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275735Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275735Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275736Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275736Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275736Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275736Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275736Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275737Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275738Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275738Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275743Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275744Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275745Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275746Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275746Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275052Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275052Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275139Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275139Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275141Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275141Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275141Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T01:58:06.275141Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314015807_AddChatAttachments') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314015807_AddChatAttachments', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    ALTER TABLE "ChatMessages" ADD "DeleteAfterAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    ALTER TABLE "ChatChannels" ADD "SelfDestructSeconds" integer;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946373Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946373Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946433Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946433Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946434Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946434Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946434Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946434Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946435Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946435Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946441Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946441Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946441Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946441Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946442Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946443Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946444Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946445Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946446Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.946446Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945721Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945721Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945819Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945819Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945819Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.945819Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.94582Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T02:53:22.94582Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314025324_AddSelfDestruct') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314025324_AddSelfDestruct', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    CREATE TABLE "MessageReadReceipts" (
        "MessageId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "ReadAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_MessageReadReceipts" PRIMARY KEY ("MessageId", "UserId"),
        CONSTRAINT "FK_MessageReadReceipts_ChatMessages_MessageId" FOREIGN KEY ("MessageId") REFERENCES "ChatMessages" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_MessageReadReceipts_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702783Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702783Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.7029Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.7029Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702901Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702901Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702901Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702901Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702904Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702904Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702904Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702904Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702905Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702905Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702905Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702905Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702906Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702906Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702906Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702906Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702907Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702907Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702907Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702907Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702918Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702918Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702918Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702918Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702919Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702919Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702919Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702919Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.70292Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.70292Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.70292Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.70292Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702921Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702921Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702921Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702921Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702922Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702922Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702923Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.702923Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701525Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701525Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701733Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701733Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701736Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701736Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701736Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T03:21:25.701736Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    CREATE INDEX "IX_MessageReadReceipts_UserId" ON "MessageReadReceipts" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314032128_AddMessageReadReceipts') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314032128_AddMessageReadReceipts', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    ALTER TABLE "ChatChannels" ADD "DeletedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    ALTER TABLE "ChatChannels" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    ALTER TABLE "ChatChannelMembers" ADD "Role" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689046Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689046Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689105Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689105Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689112Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689113Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689113Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689115Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689115Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689115Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689115Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689115Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689116Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689116Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689116Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689116Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689116Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689117Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689118Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689119Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689119Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689119Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.689119Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688441Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688442Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688516Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688516Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688517Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688517Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688517Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-14T11:18:57.688517Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260314111858_AddChatAdminFeatures') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314111858_AddChatAdminFeatures', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    ALTER TABLE "Meetings" ADD "GoogleMeetLink" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269701Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269701Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269763Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269763Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269763Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269763Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269764Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269771Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269771Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269771Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269771Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269771Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269772Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269773Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269774Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269775Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269775Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269034Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269034Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269119Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269119Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269122Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269122Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269122Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:22:39.269122Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316102240_AddGoogleMeetLinkToMeeting') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260316102240_AddGoogleMeetLinkToMeeting', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    DROP TABLE "GoogleCalendarConnections";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    ALTER TABLE "Meetings" DROP COLUMN "GoogleMeetLink";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    ALTER TABLE "CalendarEvents" DROP COLUMN "Source";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13089Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13089Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130945Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130945Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130946Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130946Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130947Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130947Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130947Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130948Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130948Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130948Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130948Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130948Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13095Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130951Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130952Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130953Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130954Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130954Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13032Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.13032Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130392Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130392Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130393Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130393Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130393Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-16T10:48:56.130393Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260316104856_RemoveGoogleIntegrations') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260316104856_RemoveGoogleIntegrations', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    ALTER TABLE "AIConversations" ADD "Title" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873049Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873049Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873304Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873304Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873306Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873306Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873307Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873307Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87331Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87331Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873311Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873311Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873311Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873311Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873312Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873312Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873312Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873312Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873313Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873314Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873314Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873314Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873315Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873315Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873316Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873316Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873317Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873317Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873317Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873317Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873325Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873326Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873326Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873326Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873327Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873327Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873327Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873327Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873328Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873328Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873329Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.873329Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87333Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87333Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.871069Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87107Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.871307Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.871307Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.871309Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87131Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87131Z', "UpdatedAt" = TIMESTAMPTZ '2026-03-18T20:24:26.87131Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318202429_AddAIConversationTitle') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260318202429_AddAIConversationTitle', '9.0.3');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    CREATE TABLE "Whiteboards" (
        "Id" uuid NOT NULL,
        "WorkspaceId" uuid NOT NULL,
        "Title" character varying(200) NOT NULL,
        "DataJson" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Whiteboards" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Whiteboards_Workspaces_WorkspaceId" FOREIGN KEY ("WorkspaceId") REFERENCES "Workspaces" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.141903Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.141904Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142295Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142296Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142297Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142297Z'
    WHERE "Id" = 'f0000000-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142315Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142315Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142315Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142315Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142318Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142318Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142318Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142318Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142319Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142319Z'
    WHERE "Id" = 'f0000000-0002-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142319Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142319Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.14232Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.14232Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.14232Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.14232Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142321Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142321Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142321Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142321Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000005';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142323Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142323Z'
    WHERE "Id" = 'f0000000-0003-0001-0001-000000000006';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142323Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142323Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142324Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142324Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142324Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142324Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142325Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142325Z'
    WHERE "Id" = 'f0000000-0004-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142325Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142325Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142326Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142326Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142326Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142326Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Permissions" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142327Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.142327Z'
    WHERE "Id" = 'f0000000-0005-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140467Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.14047Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000001';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140733Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140733Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000002';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140737Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140737Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000003';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    UPDATE "Roles" SET "CreatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140739Z', "UpdatedAt" = TIMESTAMPTZ '2026-04-21T01:38:23.140739Z'
    WHERE "Id" = 'a1b2c3d4-0001-0001-0001-000000000004';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    CREATE INDEX "IX_Whiteboards_WorkspaceId" ON "Whiteboards" ("WorkspaceId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260421013825_AddWhiteboardTable') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260421013825_AddWhiteboardTable', '9.0.3');
    END IF;
END $EF$;
COMMIT;

