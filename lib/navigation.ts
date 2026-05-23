/** Strip query/hash and trailing slashes so path matching works across browsers. */
export function normalizeAppPathname(pathname: string): string {
  const base = pathname.split(/[?#]/)[0] || "/";
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base;
}

export function isAppPathActive(pathname: string, href: string): boolean {
  const path = normalizeAppPathname(pathname);
  const target = normalizeAppPathname(href);

  if (target === "/") {
    return path === "/";
  }

  return path === target || path.startsWith(`${target}/`);
}
