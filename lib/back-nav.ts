/**
 * Explicit back targets for in-app “from” query params.
 * Prefer section ids over ambiguous `from=home`.
 *
 * | from          | Lands on home section   |
 * |---------------|-------------------------|
 * | categories    | /#categories (Explore)  |
 * | free-trial    | /#free-trial            |
 * | pricing       | /#pricing               |
 * | faq           | /#faq                   |
 */

export type BackFrom =
  | "categories"
  | "free-trial"
  | "pricing"
  | "faq"
  | "home";

export type BackTarget = {
  /** Destination (supports `/#section`) */
  href: string;
  /** Breadcrumb label beside the arrow */
  label: string;
  ariaLabel: string;
};

/** Canonical section map */
export const BACK_TARGETS: Record<
  Exclude<BackFrom, "home">,
  BackTarget
> = {
  categories: {
    href: "/#categories",
    label: "Home",
    ariaLabel: "Back to categories",
  },
  "free-trial": {
    href: "/#free-trial",
    label: "Movies & Shows",
    ariaLabel: "Back to free trial",
  },
  pricing: {
    href: "/#pricing",
    label: "Subscriptions",
    ariaLabel: "Back to plans",
  },
  faq: {
    href: "/#faq",
    label: "Support",
    ariaLabel: "Back to FAQ",
  },
};

/**
 * Resolve `?from=` to a back target.
 * @param legacyHomeAs — when `from=home` (legacy), treat as this section
 */
export function resolveBackFrom(
  from: string | null | undefined,
  options?: {
    allowed?: Array<Exclude<BackFrom, "home">>;
    legacyHomeAs?: Exclude<BackFrom, "home">;
  },
): BackTarget | null {
  if (!from) return null;

  let key = from;
  if (from === "home") {
    if (!options?.legacyHomeAs) return null;
    key = options.legacyHomeAs;
  }

  if (
    options?.allowed &&
    !options.allowed.includes(key as Exclude<BackFrom, "home">)
  ) {
    return null;
  }

  return BACK_TARGETS[key as Exclude<BackFrom, "home">] ?? null;
}

/** Query helpers for building outbound links */
export function withFrom(
  path: string,
  from: Exclude<BackFrom, "home">,
): string {
  const join = path.includes("?") ? "&" : "?";
  // Preserve existing hash (e.g. /support?from=faq#contact)
  if (path.includes("#")) {
    const [base, hash] = path.split("#");
    const joined = `${base}${join}from=${from}`;
    return `${joined}#${hash}`;
  }
  return `${path}${join}from=${from}`;
}
