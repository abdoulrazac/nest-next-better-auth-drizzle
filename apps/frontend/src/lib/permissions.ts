/**
 * Permission definitions used by the role form.
 *
 * - permissionGroups  → accordion section labels
 * - permissionList    → each resource, its human label, description, available
 *                       actions, and which accordion group it belongs to.
 *
 * Aligns with:
 *   - apps/backend/src/auth/permission.ts  (custom backend resources)
 *   - Better Auth organisation built-ins   (organization, member, invitation, team, ac)
 *
 * The backend endpoint GET /v1/accounts/roles/permissions returns the
 * authoritative resource→actions map; this file adds the human-readable layer.
 */

export const permissionGroups: Record<
  string,
  { title: string; description: string }
> = {
  accounts: {
    title: "Comptes",
    description: "Utilisateurs, rôles et fichiers",
  },
  communication: {
    title: "Communication",
    description: "Notifications, messages et webhooks",
  },
  organisation: {
    title: "Organisation",
    description: "Membres, invitations et équipes",
  },
  admin: {
    title: "Administration",
    description: "Contrôle d'accès, audit et paramètres",
  },
};

export const permissionList: Record<
  string,
  {
    title: string;
    description: string;
    actions: string[];
    group: keyof typeof permissionGroups;
  }
> = {
  // ── Accounts ────────────────────────────────────────────────────────────────
  users: {
    title: "Utilisateurs",
    description: "Gérer les comptes utilisateurs",
    actions: ["read", "write", "delete"],
    group: "accounts",
  },
  roles: {
    title: "Rôles",
    description: "Gérer les rôles et leurs permissions",
    actions: ["read", "write", "delete"],
    group: "accounts",
  },
  files: {
    title: "Fichiers",
    description: "Télécharger, consulter et supprimer des fichiers",
    actions: ["upload", "read", "delete"],
    group: "accounts",
  },

  // ── Communication ────────────────────────────────────────────────────────────
  notifications: {
    title: "Notifications",
    description: "Lire et gérer les notifications",
    actions: ["read", "manage"],
    group: "communication",
  },
  messages: {
    title: "Messages",
    description: "Lire, envoyer et supprimer des messages",
    actions: ["read", "write", "delete"],
    group: "communication",
  },
  webhooks: {
    title: "Webhooks",
    description: "Configurer les webhooks",
    actions: ["read", "write", "delete"],
    group: "communication",
  },

  // ── Organisation (Better Auth built-ins) ─────────────────────────────────────
  organization: {
    title: "Organisation",
    description: "Modifier ou supprimer l'organisation",
    actions: ["update", "delete"],
    group: "organisation",
  },
  member: {
    title: "Membres",
    description: "Gérer les membres de l'organisation",
    actions: ["create", "update", "delete"],
    group: "organisation",
  },
  invitation: {
    title: "Invitations",
    description: "Inviter et annuler des invitations",
    actions: ["create", "cancel"],
    group: "organisation",
  },
  team: {
    title: "Équipes",
    description: "Créer et gérer les équipes",
    actions: ["create", "update", "delete"],
    group: "organisation",
  },

  // ── Administration ────────────────────────────────────────────────────────────
  ac: {
    title: "Contrôle d'accès",
    description: "Gérer les règles de contrôle d'accès (rôles dynamiques)",
    actions: ["create", "read", "update", "delete"],
    group: "admin",
  },
  "audit-logs": {
    title: "Journal d'audit",
    description: "Consulter les logs d'audit",
    actions: ["read"],
    group: "admin",
  },
  settings: {
    title: "Paramètres",
    description: "Lire et modifier les paramètres de l'application",
    actions: ["read", "manage"],
    group: "admin",
  },
};
