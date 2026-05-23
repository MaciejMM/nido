export interface CategoryRule {
  patterns: RegExp[];
  categoryName: string;
}

export const MBANK_CATEGORY_RULES: CategoryRule[] = [
  {
    patterns: [
      /lidl/i,
      /biedronka/i,
      /carrefour/i,
      /kaufland/i,
      /żabka/i,
      /zabka/i,
      /rossmann/i,
      /ert wypieki/i,
      /restauracja/i,
      /mcdonald/i,
      /kfc/i,
    ],
    categoryName: "Jedzenie",
  },
  {
    patterns: [/bp-/i, /orlen/i, /shell/i, /lotos/i, /circle k/i, /stacja/i],
    categoryName: "Transport",
  },
  {
    patterns: [
      /canal\+/i,
      /netflix/i,
      /spotify/i,
      /\bplay\b/i,
      /orange/i,
      /t-mobile/i,
      /pge/i,
      /tauron/i,
    ],
    categoryName: "Rachunki",
  },
  {
    patterns: [
      /smyk/i,
      /sinsay/i,
      /\bhm\b/i,
      /pepco/i,
      /greenpoint/i,
      /zalando/i,
      /allegro/i,
      /amazon/i,
    ],
    categoryName: "Zakupy",
  },
  {
    patterns: [/apteka/i, /specjalistyczna/i],
    categoryName: "Inne",
  },
];

export const DEFAULT_IMPORT_CATEGORY = "Inne";

export function resolveCategoryName(
  title: string,
  operationDescription: string,
  rules: CategoryRule[] = MBANK_CATEGORY_RULES,
): string {
  const haystack = `${title} ${operationDescription}`;

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.categoryName;
    }
  }

  return DEFAULT_IMPORT_CATEGORY;
}

export function resolveCategoryId(
  categories: Array<{ id: string; name: string }>,
  categoryName: string,
): string {
  const match = categories.find(
    (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
  );
  if (match) return match.id;

  const fallback = categories.find(
    (category) => category.name === DEFAULT_IMPORT_CATEGORY,
  );
  if (fallback) return fallback.id;

  throw new Error(`Category not found: ${categoryName}`);
}
