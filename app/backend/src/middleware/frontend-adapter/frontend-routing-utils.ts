import { rootPaths } from "../../config/root-paths.js";

function isBackendPath(pathname: string): boolean {
  return Object.values(rootPaths).some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

export function isFrontendRequest(pathname: string): boolean {
  return !isBackendPath(pathname);
}
