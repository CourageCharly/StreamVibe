export function userInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const pair = `${first}${last}`.toUpperCase();
  if (pair) return pair;
  return (email?.trim().charAt(0) ?? "?").toUpperCase();
}
