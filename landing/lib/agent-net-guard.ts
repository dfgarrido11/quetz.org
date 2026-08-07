import { lookup } from "dns/promises";
import { isIP } from "net";

/**
 * SSRF guard for agent-supplied URLs.
 *
 * `imageUrl` is handed to Postiz, which fetches it server-side from inside the
 * private network. Without this check a token holder could aim that fetch at
 * the cloud metadata service or any internal host.
 */

function ipv4IsPublic(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0) return false; // IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a >= 224) return false; // multicast + reserved
  return true;
}

function ipv6IsPublic(ip: string): boolean {
  const addr = ip.toLowerCase().split("%")[0];
  if (addr === "::" || addr === "::1") return false;

  // IPv4-mapped (::ffff:a.b.c.d) — judge by the embedded v4 address.
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return ipv4IsPublic(mapped[1]);

  if (/^f[cd]/.test(addr)) return false; // unique local fc00::/7
  if (/^fe[89ab]/.test(addr)) return false; // link-local fe80::/10
  if (/^ff/.test(addr)) return false; // multicast
  return true;
}

function addressIsPublic(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return ipv4IsPublic(ip);
  if (version === 6) return ipv6IsPublic(ip);
  return false;
}

/**
 * Resolves the hostname and rejects the URL if any address it maps to is
 * private, loopback, link-local or otherwise non-routable.
 */
export async function assertPublicHttpsUrl(raw: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "must be an absolute URL";
  }

  if (url.protocol !== "https:") return "must use https";
  if (url.username || url.password) return "must not contain credentials";

  const host = url.hostname.replace(/^\[|\]$/g, "");

  if (isIP(host)) {
    return addressIsPublic(host) ? null : "resolves to a non-public address";
  }

  if (/\.(local|internal|localhost)$/i.test(host) || host === "localhost") {
    return "resolves to a non-public address";
  }

  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true });
  } catch {
    return "hostname could not be resolved";
  }

  if (records.length === 0) return "hostname could not be resolved";
  if (!records.every((r) => addressIsPublic(r.address))) {
    return "resolves to a non-public address";
  }

  return null;
}
