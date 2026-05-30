import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Enterprise Boilerplate",
    template: "%s | Enterprise Boilerplate",
  },
  description: "NestJS + Next.js + Better-Auth + Drizzle enterprise starter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
