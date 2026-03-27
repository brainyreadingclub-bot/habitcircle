import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const db = getDb();

    // Get recent activity from friends' shared habits
    const feed = db.prepare(`
      SELECT
        hl.date,
        hl.created_at,
        h.name as habit_name,
        h.emoji as habit_emoji,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_color
      FROM habit_logs hl
      JOIN habits h ON h.id = hl.habit_id
      JOIN users u ON u.id = hl.user_id
      WHERE h.is_shared = 1
        AND hl.completed = 1
        AND hl.date >= date('now', '-7 days')
        AND u.id IN (
          SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END
          FROM friendships
          WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
        )
      ORDER BY hl.created_at DESC
      LIMIT 50
    `).all(session.userId, session.userId, session.userId);

    return jsonResponse({ feed });
  } catch (error) {
    logError('GET /api/feed', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
