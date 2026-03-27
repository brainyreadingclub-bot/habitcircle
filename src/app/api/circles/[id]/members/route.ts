import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, getDaysArray, todayStr } from '@/lib/utils';
import { logError } from '@/lib/logger';

// Leave a circle (non-owner only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const db = getDb();

    const membership = db.prepare(
      'SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?'
    ).get(id, session.userId) as { role: string } | undefined;

    if (!membership) return errorResponse('서클에 가입되어 있지 않습니다.', 404);
    if (membership.role === 'owner') return errorResponse('서클 관리자는 나갈 수 없습니다. 서클을 삭제하세요.', 400);

    db.prepare('DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?').run(id, session.userId);
    db.prepare('DELETE FROM circle_habits WHERE circle_id = ? AND user_id = ?').run(id, session.userId);

    return jsonResponse({ message: '서클을 나왔습니다.' });
  } catch (error) {
    logError('DELETE /api/circles/[id]/members', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

// Get circle members with their habit progress (last 7 days)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const db = getDb();

    // Verify membership
    const member = db.prepare(
      'SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?'
    ).get(id, session.userId);

    if (!member) return errorResponse('서클에 가입되어 있지 않습니다.', 403);

    const today = todayStr();
    const days = getDaysArray(7, today);

    // Get members
    const members = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_color, cm.role
      FROM circle_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.circle_id = ?
      ORDER BY cm.joined_at ASC
    `).all(id) as Array<{ id: number; username: string; display_name: string; avatar_color: string; role: string }>;

    // Get circle habits and their logs for each member
    const membersProgress = members.map(m => {
      // Get habits linked to this circle by this user
      const circleHabits = db.prepare(`
        SELECT h.id, h.name, h.emoji
        FROM circle_habits ch
        JOIN habits h ON h.id = ch.habit_id
        WHERE ch.circle_id = ? AND ch.user_id = ?
      `).all(id, m.id) as Array<{ id: number; name: string; emoji: string }>;

      // If no circle habit linked, get all active habits
      const habits = circleHabits.length > 0 ? circleHabits :
        (db.prepare(
          'SELECT id, name, emoji FROM habits WHERE user_id = ? AND is_active = 1 AND is_shared = 1'
        ).all(m.id) as Array<{ id: number; name: string; emoji: string }>);

      // Get completion status for each day
      const dailyProgress = days.map(day => {
        const totalHabits = habits.length;
        if (totalHabits === 0) return { date: day, completed: 0, total: 0 };

        const completedCount = db.prepare(`
          SELECT COUNT(*) as count FROM habit_logs
          WHERE user_id = ? AND date = ? AND habit_id IN (${habits.map(() => '?').join(',')})
        `).get(m.id, day, ...habits.map(h => h.id)) as { count: number };

        return {
          date: day,
          completed: completedCount.count,
          total: totalHabits,
        };
      });

      return {
        ...m,
        displayName: m.display_name,
        avatarColor: m.avatar_color,
        habits,
        dailyProgress,
      };
    });

    return jsonResponse({ members: membersProgress, days });
  } catch (error) {
    logError('GET /api/circles/[id]/members', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
