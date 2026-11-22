function clean(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function isEmail(value: string): boolean {
  return value.includes("@");
}

export function givenNameFromEmail(
  email: string | null | undefined,
): string | undefined {
  const local = clean(email)?.split("@")[0];
  const match = local?.match(/[A-Za-zÀ-ÿ]{2,}/);
  if (!match) return undefined;
  const word = match[0].toLocaleLowerCase("pl");
  return word.charAt(0).toLocaleUpperCase("pl") + word.slice(1);
}

/** A label safe to show in the budget. Never returns an email address. */
export function personLabel(
  value: string | null | undefined,
): string | undefined {
  const text = clean(value);
  if (!text) return undefined;
  if (isEmail(text)) return givenNameFromEmail(text);
  return text;
}

function realName(value: string | null | undefined): string | undefined {
  const text = clean(value);
  if (!text || isEmail(text)) return undefined;
  return text;
}

export function kindeDisplayName(user: {
  given_name?: string | null;
  family_name?: string | null;
  email?: string | null;
  username?: string | null;
  preferred_username?: string | null;
  name?: string | null;
} | null | undefined): string | undefined {
  if (!user) return undefined;

  const given = realName(user.given_name);
  const family = realName(user.family_name);
  if (given && family) return `${given} ${family}`;
  if (given) return given;

  return (
    realName(user.name) ||
    realName(user.username) ||
    realName(user.preferred_username) ||
    family ||
    givenNameFromEmail(user.email)
  );
}
