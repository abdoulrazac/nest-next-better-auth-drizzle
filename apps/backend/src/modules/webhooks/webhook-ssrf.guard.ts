// apps/backend/src/modules/webhooks/webhook-ssrf.guard.ts
import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { networkInterfaces } from 'node:os';

/**
 * Network destinations that must never receive outbound webhook traffic.
 * Helps mitigate Server-Side Request Forgery (SSRF) when an operator with the
 * `webhooks.write` permission registers an arbitrary URL.
 */
const BLOCKED_HOSTS = new Set<string>([
  'localhost',
  'ip6-localhost',
  'ip6-loopback',
  'broadcasthost',
  'metadata.google.internal', // GCP metadata
]);

// Cloud metadata endpoints reachable via the well-known link-local IP.
const BLOCKED_IP_LITERALS = [
  '169.254.169.254', // AWS / Azure / GCP metadata
  'fd00:ec2::254', // AWS IMDS on IPv6
  'fe80::ec2::254',
];

function isBlockedIp(ip: string): boolean {
  if (BLOCKED_IP_LITERALS.includes(ip)) return true;

  // IPv4 private / reserved ranges
  const v4 = ip.split('.').map(Number);
  if (
    v4.length === 4 &&
    v4.every((o) => Number.isInteger(o) && o >= 0 && o <= 255)
  ) {
    const [a, b] = v4;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a >= 224) return true; // multicast / reserved (224.0.0.0/4, 240.0.0.0/4)
  }

  // IPv6 loopback / link-local / unique-local
  if (
    ip === '::1' ||
    ip.startsWith('fe80') ||
    ip.startsWith('fc') ||
    ip.startsWith('fd')
  ) {
    return true;
  }

  return false;
}

/** Returns true if any local interface owns this IP (extra SSRF belt). */
function isLocalInterfaceIp(ip: string): boolean {
  const addrs = new Set<string>();
  for (const list of Object.values(networkInterfaces())) {
    for (const entry of list ?? []) {
      addrs.add(entry.address);
    }
  }
  return addrs.has(ip);
}

/**
 * Validates that a webhook URL is safe to call from the server.
 * Throws `BadRequestException` on rejection. Resolves parsed URL otherwise.
 */
export async function assertSafeWebhookUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestException(`Invalid webhook URL: ${rawUrl}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('Webhook URL must use http or https');
  }

  const host = url.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(host)) {
    throw new BadRequestException(`Webhook host '${host}' is blocked`);
  }

  // Literal IP in the URL?
  if (isBlockedIp(host) || isLocalInterfaceIp(host)) {
    throw new BadRequestException('Webhook URL points to a blocked address');
  }

  // Resolve hostname and check every resolved address.
  let resolved: string[];
  try {
    const records = await lookup(host, { all: true });
    resolved = records.map((r) => r.address);
  } catch {
    throw new BadRequestException(`Could not resolve webhook host '${host}'`);
  }

  for (const ip of resolved) {
    if (isBlockedIp(ip) || isLocalInterfaceIp(ip)) {
      throw new BadRequestException(
        `Webhook host '${host}' resolves to a blocked address (${ip})`,
      );
    }
  }

  return url;
}
