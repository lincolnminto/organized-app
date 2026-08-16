import { differenceInYears, isValid, parseISO } from 'date-fns';

/**
 * Compute a person's age (in whole years) at a given reference date.
 *
 * Dependency-free helper (no `@`-alias imports) so it stays isolated and
 * trivially testable. Used by the midweek autofill pairing rule to decide
 * whether a participant counts as a minor at the meeting date.
 *
 * @param birthISO - ISO birth date string, or null/undefined/empty.
 * @param atDate - Reference date (ISO string or Date) to compute age at.
 * @returns Age in whole years, or `null` when the birth date is missing or
 *   either date is invalid. Callers treat a `null` result as "adult".
 */
export const getAge = (
  birthISO: string | null | undefined,
  atDate: string | Date
): number | null => {
  if (!birthISO) return null;

  const birth = parseISO(birthISO);
  const at = typeof atDate === 'string' ? parseISO(atDate) : atDate;

  if (!isValid(birth) || !isValid(at)) return null;

  return differenceInYears(at, birth);
};
