import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { habitIds } = await request.json();

    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return errorResponse('habitIds 배열이 필요합니다.', 400);
    }

    const db = getDb();

    // Verify all habits belong to this user
    const placeholders = habitIds.map(() => '?').join(',');
    const userHabits = db.prepare(
      `SELECT id FROM habits WHERE user_id = ? AND id IN (${placeholders})`
    ).all(session.userId, ...habitIds) as Array<{ id: number }>;

    if (userHabits.length !== habitIds.length) {
      return errorResponse('잘못된 습관 ID가 포함되어 있습니다.', 400);
    }

    const updateOrder = db.transaction(() => {
      const stmt = db.prepare('UPDATE habits SET sort_order = ? WHERE id = ? AND user_id = ?');
      habitIds.forEach((id: number, index: number) => {
        stmt.run(index, id, session.userId);
      });
    });

    updateOrder();

    return jsonResponse({ success: true });
  } catch (error) {
    logError('PUT /api/habits/reorder', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
