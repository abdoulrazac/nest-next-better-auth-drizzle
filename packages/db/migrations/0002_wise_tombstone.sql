ALTER TABLE "organization" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_personal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "plan" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "plan_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "plan_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "team_slug_organizationId_uidx" ON "team" USING btree ("slug","organization_id");