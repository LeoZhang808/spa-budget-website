export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
