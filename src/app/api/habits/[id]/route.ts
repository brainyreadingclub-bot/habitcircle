import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, todayStr } from '@/lib/utils';
import { calculateStreak, getCompletionRate } from '@/lib/streaks';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const db = getDb();
    const today = todayStr();

    const habit = db.prepare(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?'
    ).get(id, session.userId) as Record<string, unknown> | undefined;

    if (!habit) return errorResponse('습관을 찾을 수 없습니다.', 404);

    const logs = db.prepare(
      'SELECT date, completed FROM habit_logs WHERE habit_id = ? ORDER BY date ASC'
    ).all(id) as Array<{ date: string; completed: number }>;

    const streak = calculateStreak(logs, today);
    const rate7 = getCompletionRate(logs, 7, today);
    const rate30 = getCompletionRate(logs, 30, today);

    return jsonResponse({
      habit: {
        ...habit,
        streak: streak.current,
        longestStreak: streak.longest,
        completionRate7: rate7,
        completionRate30: rate30,
        logs,
      },
    });
  } catch (error) {
    logError('GET /api/habits/[id]', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const habit = db.prepare(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?'
    ).get(id, session.userId);

    if (!habit) return errorResponse('습관을 찾을 수 없습니다.', 404);

    const updates: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name', description: 'description', emoji: 'emoji',
      triggerTime: 'trigger_time', triggerLocation: 'trigger_location',
      smallestVersion: 'smallest_version', reward: 'reward',
    };

    for (const [bodyKey, dbCol] of Object.entries(fieldMap)) {
      if (body[bodyKey] !== undefined) {
        updates.push(`${dbCol} = ?`);
        values.push(body[bodyKey]);
      }
    }
    if (body.isShared !== undefined) { updates.push('is_shared = ?'); values.push(body.isShared ? 1 : 0); }
    if (body.isActive !== undefined) { updates.push('is_active = ?'); values.push(body.isActive ? 1 : 0); }

    if (updates.length === 0) return errorResponse('수정할 내용이 없습니다.', 400);

    updates.push("updated_at = datetime('now')");
    values.push(id, session.userId);

    db.prepare(
      `UPDATE habits SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    ).run(...values);

    return jsonResponse({ message: '습관이 수정되었습니다.' });
  } catch (error) {
    logError('PUT /api/habits/[id]', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const db = getDb();

    const result = db.prepare(
      'UPDATE habits SET is_active = 0 WHERE id = ? AND user_id = ?'
    ).run(id, session.userId);

    if (result.changes === 0) return errorResponse('습관을 찾을 수 없습니다.', 404);
    return jsonResponse({ message: '습관이 삭제되었습니다.' });
  } catch (error) {
    logError('DELETE /api/habits/[id]', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
