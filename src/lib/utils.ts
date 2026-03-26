import { randomBytes } from 'crypto';

export function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const d = new Date(date + 'T00:00:00Z');
  return !isNaN(d.getTime());
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return Array.from(bytes)
    .map(b => chars[b % chars.length])
    .join('');
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export function getDaysArray(days: number, today?: string): string[] {
  const todayD = today || todayStr();
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayD + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}
