import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  // Detect Railway (and other reverse-proxy) HTTPS via x-forwarded-proto.
  // The header may contain a comma-separated list when multiple proxies are
  // chained (e.g. "https, http"), so we check each entry individually.
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  // sameSite: "none" is required for cross-site cookie delivery, but the
  // browser will silently reject any "none" cookie that is not also marked
  // Secure.  We therefore always set secure: true when sameSite is "none",
  // regardless of what the local protocol field reports.  Railway terminates
  // TLS at its edge proxy and forwards requests over plain HTTP internally,
  // so req.protocol is "http" even for genuine HTTPS connections — the
  // x-forwarded-proto header is the authoritative signal, but forcing
  // secure: true here is the safest default for a production deployment.
  const sameSite = "none" as const;
  const secure = sameSite === "none" ? true : isSecureRequest(req);

  console.log(
    `[Auth] Cookie options — sameSite: ${sameSite}, secure: ${secure}, ` +
    `protocol: ${req.protocol}, x-forwarded-proto: ${req.headers["x-forwarded-proto"] ?? "(none)"}`
  );

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
