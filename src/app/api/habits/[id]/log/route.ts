import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, isValidDate, todayStr } from '@/lib/utils';
import { logError } from '@/lib/logger';

// Toggle habit completion for a date
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const { date } = await request.json();

    if (!date || !isValidDate(date)) {
      return errorResponse('유효하지 않은 날짜 형식입니다. (YYYY-MM-DD)', 400);
    }

    const serverToday = todayStr();
    if (date !== serverToday) {
      return errorResponse('오늘 날짜만 기록할 수 있습니다.', 400);
    }

    const db = getDb();

    const habit = db.prepare(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?'
    ).get(id, session.userId);

    if (!habit) return errorResponse('습관을 찾을 수 없습니다.', 404);

    const existing = db.prepare(
      'SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?'
    ).get(id, date);

    if (existing) {
      db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?').run(id, date);
      return jsonResponse({ completed: false, message: '완료 취소' });
    } else {
      db.prepare(
        'INSERT INTO habit_logs (habit_id, user_id, date) VALUES (?, ?, ?)'
      ).run(id, session.userId, date);
      return jsonResponse({ completed: true, message: '완료!' });
    }
  } catch (error) {
    logError('POST /api/habits/[id]/log', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

// Get logs for a habit
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const db = getDb();

    const habit = db.prepare(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?'
    ).get(id, session.userId);

    if (!habit) return errorResponse('습관을 찾을 수 없습니다.', 404);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let logs;
    if (from && to && isValidDate(from) && isValidDate(to)) {
      logs = db.prepare(
        'SELECT date, completed, note FROM habit_logs WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date ASC'
      ).all(id, from, to);
    } else {
      logs = db.prepare(
        'SELECT date, completed, note FROM habit_logs WHERE habit_id = ? ORDER BY date DESC LIMIT 90'
      ).all(id);
    }

    return jsonResponse({ logs });
  } catch (error) {
    logError('GET /api/habits/[id]/log', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
