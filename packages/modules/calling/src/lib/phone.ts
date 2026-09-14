export function formatPhoneE164(input: string): string {
  if (!input.trim()) return input;

  const hasPlus = input.trimStart().startsWith("+");
  const digits = input.replace(/\D/g, "");

  if (!digits) return input;

  // Already has country code prefix
  if (hasPlus) return `+${digits}`;

  // 10 digits → assume US/Canada
  if (digits.length === 10) return `+1${digits}`;

  // 11 digits starting with 1 → US/Canada with country code
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  // Anything else → just prepend +
  return `+${digits}`;
}
