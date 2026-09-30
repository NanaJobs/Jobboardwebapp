/**
 * Ethiopian Birr (ETB / ብር) Currency Formatting Utilities
 */

export function formatCurrency(
  amount: number | string | null | undefined,
  locale?: string
): string {
  if (amount === null || amount === undefined || amount === "") return "";
  const num = Number(amount);
  if (isNaN(num)) return String(amount);

  const formatted = num.toLocaleString("en-US");
  if (locale === "am") {
    return `${formatted} ብር`;
  }
  return `${formatted} ETB`;
}

export function formatSalary(
  job: {
    min_salary?: number | string | null;
    max_salary?: number | string | null;
    salary_currency?: string;
  },
  locale?: string
): string {
  const min = job.min_salary ? Number(job.min_salary) : null;
  const max = job.max_salary ? Number(job.max_salary) : null;
  const curr = locale === "am" ? "ብር" : "ETB";

  if (min && max) {
    if (min >= 1000 && max >= 1000) {
      return `${(min / 1000).toFixed(0)}k – ${(max / 1000).toFixed(0)}k ${curr}`;
    }
    return `${min.toLocaleString()} – ${max.toLocaleString()} ${curr}`;
  } else if (min) {
    if (min >= 1000) {
      return locale === "am"
        ? `ከ ${(min / 1000).toFixed(0)}k ${curr}`
        : `From ${(min / 1000).toFixed(0)}k ${curr}`;
    }
    return locale === "am"
      ? `ከ ${min.toLocaleString()} ${curr}`
      : `From ${min.toLocaleString()} ${curr}`;
  } else if (max) {
    if (max >= 1000) {
      return locale === "am"
        ? `እስከ ${(max / 1000).toFixed(0)}k ${curr}`
        : `Up to ${(max / 1000).toFixed(0)}k ${curr}`;
    }
    return locale === "am"
      ? `እስከ ${max.toLocaleString()} ${curr}`
      : `Up to ${max.toLocaleString()} ${curr}`;
  }
  return locale === "am" ? "ተመጣጣኝ ደመወዝ" : "Competitive";
}
