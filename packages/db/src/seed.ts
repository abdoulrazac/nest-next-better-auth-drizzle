/**
 * packages/db/src/seed.ts
 *
 * Seeds the database with an initial admin user and default roles.
 *
 * Usage:
 *   cd packages/db
 *   DATABASE_URL=... bun run src/seed.ts
 *
 * Or via the script in package.json:
 *   bun run db:seed
 */

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { role, user, userRole } from "./schema";

const ADMIN_EMAIL = process.env["SEED_ADMIN_EMAIL"] ?? "admin@example.com";
const ADMIN_NAME = process.env["SEED_ADMIN_NAME"] ?? "Admin";

const EXTRA_USERS = [
  { email: "john@example.com", name: "John Doe", role: "member" as const },
  { email: "jane@example.com", name: "Jane Doe", role: "viewer" as const },
];

const DEFAULT_ROLES = [
  {
    name: "admin",
    permissions: [
      "users:read",
      "users:write",
      "users:delete",
      "roles:read",
      "roles:write",
      "roles:delete",
      "audit-logs:read",
      "files:upload",
      "files:read",
      "files:delete",
      "settings:read",
      "settings:manage",
      "notifications:read",
      "notifications:manage",
      "webhooks:read",
      "webhooks:write",
      "webhooks:delete",
    ],
  },
  {
    name: "member",
    permissions: [
      "users:read",
      "files:upload",
      "files:read",
      "notifications:read",
      "settings:read",
    ],
  },
  {
    name: "viewer",
    permissions: ["users:read", "files:read", "notifications:read"],
  },
];

async function seed() {
  console.log("Seeding database...");

  // --- Roles ---
  console.log("  Creating default roles...");
  const createdRoles: Record<string, string> = {};

  for (const r of DEFAULT_ROLES) {
    const existing = await db
      .select({ id: role.id })
      .from(role)
      .where(eq(role.name, r.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`    Role '${r.name}' already exists — skipping`);
      createdRoles[r.name] = existing[0]!.id;
    } else {
      const [created] = await db
        .insert(role)
        .values({ name: r.name, permissions: r.permissions })
        .returning({ id: role.id });
      createdRoles[r.name] = created!.id;
      console.log(`    Created role '${r.name}'`);
    }
  }

  // --- Admin user ---
  console.log(`  Creating admin user (${ADMIN_EMAIL})...`);

  const existingAdmin = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  let adminId: string;

  if (existingAdmin.length > 0) {
    adminId = existingAdmin[0]!.id;
    console.log("    Admin user already exists — skipping");
  } else {
    // Note: Better-Auth manages its own password hashing via the `account` table.
    // This seed creates the user row directly. To log in, use Better-Auth's
    // signUp.email() on first boot, or use the Better-Auth admin API to set the password.
    adminId = crypto.randomUUID();
    await db.insert(user).values({
      id: adminId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "admin",
    });
    console.log(`    Created admin user: ${ADMIN_EMAIL}`);
    console.log(
      "    Password not set — use Better-Auth signUp or reset flow to set a password.",
    );
  }

  // --- Assign admin role ---
  const existingRole = await db
    .select({ id: userRole.id })
    .from(userRole)
    .where(eq(userRole.userId, adminId))
    .limit(1);

  if (existingRole.length === 0 && createdRoles["admin"]) {
    await db.insert(userRole).values({
      userId: adminId,
      roleId: createdRoles["admin"],
    });
    console.log("    Assigned 'admin' role to admin user");
  }

  // --- Extra users (member + viewer) ---
  console.log("  Creating extra users...");

  for (const u of EXTRA_USERS) {
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, u.email))
      .limit(1);

    let userId: string;

    if (existing.length > 0) {
      userId = existing[0]!.id;
      console.log(`    User '${u.email}' already exists — skipping`);
    } else {
      userId = crypto.randomUUID();
      await db.insert(user).values({
        id: userId,
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
      });
      console.log(`    Created user: ${u.email} (${u.role})`);
    }

    const existingUserRole = await db
      .select({ id: userRole.id })
      .from(userRole)
      .where(eq(userRole.userId, userId))
      .limit(1);

    if (existingUserRole.length === 0 && createdRoles[u.role]) {
      await db.insert(userRole).values({
        userId,
        roleId: createdRoles[u.role]!,
      });
      console.log(`    Assigned '${u.role}' role to ${u.email}`);
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
