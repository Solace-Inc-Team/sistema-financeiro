const pad = (n) => String(n).padStart(2, '0');

/** Mês atual (AAAA-MM) no fuso local do servidor. */
export function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Soma (ou subtrai) meses de um valor AAAA-MM. */
export function addMonths(month, delta) {
  const [year, m] = month.split('-').map(Number);
  const index = year * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}
