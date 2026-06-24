// apps/frontend/src/app/api-test/page.tsx
// Smoke-test — remove before production
import { apiClient } from "@/lib/api";

export default async function ApiTestPage() {
  let status = "untested";

  try {
    const response = await fetch(
      `${process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3000"}/api/health`,
      { cache: "no-store" },
    );
    status = response.ok ? "ok" : `error ${response.status}`;
  } catch {
    status = "unreachable";
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>API Client Smoke Test</h1>
      <p>
        Backend health: <strong>{status}</strong>
      </p>
      <p>
        API base URL:{" "}
        <code>
          {process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3000"}
        </code>
      </p>
      <p>
        <code>apiClient</code> configured:{" "}
        <strong>{apiClient ? "yes" : "no"}</strong>
      </p>
    </main>
  );
}
