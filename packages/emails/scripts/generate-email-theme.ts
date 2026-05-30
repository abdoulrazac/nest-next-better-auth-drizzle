#!/usr/bin/env bun
/**
 * Script pour générer template/email-theme.ts depuis global.css
 *
 * Ce script lit le fichier global.css, extrait les variables CSS OKLCH,
 * les convertit en hexadécimal, et génère le fichier template/email-theme.ts
 */

import { formatHex, type Color } from "culori";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Obtenir le chemin du répertoire du script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);
const REPO_ROOT = dirname(dirname(PROJECT_ROOT));

// Configuration
const GLOBAL_CSS_PATH = join(REPO_ROOT, "apps/frontend/src/app/globals.css");
const EMAIL_THEME_PATH = join(PROJECT_ROOT, "template", "email-theme.ts");

/**
 * Parse une valeur OKLCH et retourne un objet Color
 * Format attendu: oklch(L C H) ou oklch(L C H / alpha)
 */
function parseOklch(value: string): Color | null {
  // Nettoyer la valeur
  const cleaned = value.trim().replace(/['"]/g, "");

  // Extraire les valeurs avec regex
  const match = cleaned.match(
    /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/,
  );

  if (!match) return null;

  const [, l, c, h, alpha] = match;
  return {
    mode: "oklch",
    l: Number.parseFloat(l || "0"),
    c: Number.parseFloat(c || "0"),
    h: h ? Number.parseFloat(h) : 1,
    alpha: alpha ? Number.parseFloat(alpha) : 1,
  };
}

/**
 * Convertit une couleur en hexadécimal (format #RRGGBB)
 */
function toHex(color: Color): string {
  const hex = formatHex(color);
  if (!hex) return "#000000";
  return hex.startsWith("#") ? hex : `#${hex}`;
}

/**
 * Extrait toutes les variables CSS d'un sélecteur spécifique (ex: :root, .dark)
 */
function extractCssVariablesFromSelector(
  cssContent: string,
  selector: string,
): Map<string, string> {
  const variables = new Map<string, string>();

  // Regex pour trouver le contenu d'un sélecteur spécifique
  const selectorRegex = new RegExp(`${selector}\\s*\\{([^}]+)\\}`, "gs");
  const match = selectorRegex.exec(cssContent);

  if (!match || !match[1]) {
    return variables;
  }

  const content = match[1];

  // Regex pour capturer les définitions de variables CSS
  const varRegex = /--([\w-]+):\s*([^;]+);/g;
  let varMatch;

  while ((varMatch = varRegex.exec(content)) !== null) {
    const [, varName, varValue] = varMatch;
    variables.set(varName!, String(varValue || ""));
  }

  return variables;
}

/**
 * Génère le contenu du fichier template/email-theme.ts
 */
function generateEmailTheme(cssContent: string): string {
  // Extraire les variables du mode clair (:root)
  const variables = extractCssVariablesFromSelector(cssContent, ":root");

  // Fonction helper pour convertir une variable CSS en hex
  const getHex = (varName: string): string => {
    const value = variables.get(varName);
    if (!value) return "#000000";
    const color = parseOklch(value);
    return color ? toHex(color) : "#000000";
  };

  // Mapper les variables CSS vers les couleurs de l'email
  const colors = {
    background: getHex("background"),
    backgroundLight: "#ffffff", // Les emails ont besoin d'un fond blanc
    foreground: getHex("foreground"),
    muted: getHex("muted"),
    mutedForeground: getHex("muted-foreground"),
    border: getHex("border"),
    borderLight: getHex("muted"),
    accent: getHex("accent"),
    accentForeground: getHex("accent-foreground"),
    primary: getHex("primary"),
    primaryForeground: getHex("primary-foreground"),
    destructive: getHex("destructive"),
  };

  // Générer le contenu du fichier
  return `/**
 * Thème partagé pour les emails
 *
 * ⚠️ IMPORTANT: Ce fichier est GÉNÉRÉ AUTOMATIQUEMENT depuis global.css
 * NE MODIFIEZ PAS CE FICHIER DIRECTEMENT.
 *
 * Pour mettre à jour les couleurs des emails :
 * 1. Modifiez les variables dans apps/frontend/src/app/globals.css
 * 2. Exécutez: bun run generate:email-theme
 *
 * Les couleurs OKLCH de global.css sont automatiquement converties en hexadécimal
 * pour la compatibilité avec les clients email.
 */

export const emailTheme = {
	colors: {
		// Primary
		primary: "${colors.primary}",
		primaryForeground: "${colors.primaryForeground}",

		// Foreground
		foreground: "${colors.foreground}",

		// Background
		background: "${colors.background}",
		backgroundLight: "${colors.backgroundLight}",

		// Muted
		muted: "${colors.muted}",
		mutedForeground: "${colors.mutedForeground}",

		// Border
		border: "${colors.border}",
		borderLight: "${colors.borderLight}",

		// Accent
		accent: "${colors.accent}",
		accentForeground: "${colors.accentForeground}",

		// Destructive
		destructive: "${colors.destructive}",
	},
} as const;

// Styles pour les composants d'emails
export const emailStyles = {
	// Layout principal
	main: {
		backgroundColor: emailTheme.colors.background,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	},

	container: {
		backgroundColor: emailTheme.colors.backgroundLight,
		margin: "40px auto",
		borderRadius: "8px",
		overflow: "hidden",
		maxWidth: "560px",
		border: \`1px solid \${emailTheme.colors.border}\`,
	},

	// Header
	header: {
		backgroundColor: emailTheme.colors.primary,
		padding: "24px 32px",
	},

	brandText: {
		color: emailTheme.colors.primaryForeground,
		fontSize: "18px",
		fontWeight: "700",
		margin: "0",
	},

	// Content
	content: {
		padding: "32px",
	},

	// Heading
	heading: {
		color: emailTheme.colors.foreground,
		fontSize: "22px",
		fontWeight: "700",
		margin: "0 0 12px",
	},

	// Body text
	body: {
		color: emailTheme.colors.mutedForeground,
		fontSize: "15px",
		lineHeight: "24px",
		margin: "0 0 24px",
	},

	// Button
	button: {
		backgroundColor: emailTheme.colors.foreground,
		borderRadius: "6px",
		color: emailTheme.colors.primaryForeground,
		display: "inline-block",
		fontSize: "14px",
		fontWeight: "600",
		padding: "12px 24px",
		textDecoration: "none",
		textAlign: "center" as const,
	},

	buttonPrimary: {
		backgroundColor: emailTheme.colors.primary,
		borderRadius: "6px",
		color: emailTheme.colors.primaryForeground,
		display: "inline-block",
		fontSize: "14px",
		fontWeight: "600",
		padding: "12px 24px",
		textDecoration: "none",
		textAlign: "center" as const,
	},

	// Note
	note: {
		color: emailTheme.colors.mutedForeground,
		fontSize: "12px",
		lineHeight: "18px",
		margin: "24px 0 0",
	},

	// Footer
	footer: {
		backgroundColor: emailTheme.colors.background,
		padding: "20px 32px",
		textAlign: "center" as const,
	},

	footerText: {
		color: emailTheme.colors.mutedForeground,
		fontSize: "12px",
		margin: "0",
		lineHeight: "18px",
	},

	// Divider
	hr: {
		borderColor: emailTheme.colors.border,
		margin: "0",
	},

	// Destructive styles
	headingDestructive: {
		color: emailTheme.colors.destructive,
		fontSize: "22px",
		fontWeight: "700",
		margin: "0 0 12px",
	},

	buttonDestructive: {
		backgroundColor: emailTheme.colors.destructive,
		borderRadius: "6px",
		color: "#ffffff",
		display: "inline-block",
		fontSize: "14px",
		fontWeight: "600",
		padding: "12px 24px",
		textDecoration: "none",
		textAlign: "center" as const,
	},

	warningBox: {
		backgroundColor: "#fef2f2",
		borderLeft: \`4px solid \${emailTheme.colors.destructive}\`,
		borderRadius: "4px",
		padding: "12px 16px",
		margin: "0 0 24px",
	},

	warningText: {
		color: emailTheme.colors.destructive,
		fontSize: "13px",
		lineHeight: "20px",
		margin: "0",
	},

	// Badge styles
	badge: {
		backgroundColor: emailTheme.colors.muted,
		borderRadius: "4px",
		color: emailTheme.colors.mutedForeground,
		display: "inline-block",
		fontSize: "13px",
		fontWeight: "500",
		padding: "4px 10px",
		margin: "0 0 24px",
	},

	// OTP styles
	otpBox: {
		backgroundColor: emailTheme.colors.muted,
		borderRadius: "8px",
		padding: "20px",
		textAlign: "center" as const,
		margin: "0 0 24px",
	},

	otpCode: {
		color: emailTheme.colors.foreground,
		fontSize: "36px",
		fontWeight: "700",
		letterSpacing: "8px",
		margin: "0",
	},
} as const;
`;
}

/**
 * Fonction principale
 */
function main() {
  console.log("🎨 Génération du thème email depuis global.css...\n");

  // Lire le fichier CSS
  try {
    const cssContent = readFileSync(GLOBAL_CSS_PATH, "utf-8");
    console.log(`✓ Fichier global.css lu (${cssContent.length} caractères)`);
  } catch (error) {
    console.error(`❌ Erreur: Impossible de lire ${GLOBAL_CSS_PATH}`);
    console.error(error);
    process.exit(1);
  }

  const cssContent = readFileSync(GLOBAL_CSS_PATH, "utf-8");

  // Extraire les variables du mode clair (:root)
  const variables = extractCssVariablesFromSelector(cssContent, ":root");
  console.log(
    `✓ ${variables.size} variables CSS extraites de :root (ex: --background, --foreground, ...)`,
  );

  // Vérifier les variables nécessaires
  const requiredVars = [
    "background",
    "foreground",
    "muted",
    "muted-foreground",
    "border",
    "accent",
    "accent-foreground",
    "primary",
    "primary-foreground",
    "destructive",
  ];

  const missingVars = requiredVars.filter((v) => !variables.has(v));
  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Variables manquantes (mode clair): ${missingVars.join(", ")}`,
    );
  }

  // Générer le thème
  const themeContent = generateEmailTheme(cssContent);

  // Écrire le fichier
  writeFileSync(EMAIL_THEME_PATH, themeContent, "utf-8");
  console.log(`✓ ${EMAIL_THEME_PATH} généré avec succès\n`);

  // Afficher un résumé des couleurs
  console.log("📋 Couleurs extraites de :root:");
  const getHex = (varName: string): string => {
    const value = variables.get(varName);
    if (!value) return "#000000";
    const color = parseOklch(value);
    return color ? toHex(color) : "#000000";
  };

  requiredVars.forEach((varName) => {
    const hex = getHex(varName);
    console.log(`   --${varName} → ${hex}`);
  });

  console.log("\n✅ Terminé !");
  console.log(
    "💡 Pour mettre à jour les couleurs, modifiez global.css et relancez ce script.",
  );
}

main();
