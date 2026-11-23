export const HIDE_AMOUNTS_COOKIE = "nido-hide-amounts";

export function hideAmountsCookie(hidden: boolean): string {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  return `${HIDE_AMOUNTS_COOKIE}=${hidden ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}
