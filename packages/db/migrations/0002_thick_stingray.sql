DROP INDEX "team_slug_organizationId_uidx";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan_expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "updated_at";