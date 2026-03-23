import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, todayStr } from '@/lib/utils';
import { calculateStreak } from '@/lib/streaks';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const db = getDb();
  const today = todayStr();

  const habits = db.prepare(`
    SELECT h.*,
           CASE WHEN hl.id IS NOT NULL THEN 1 ELSE 0 END as completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.date = ?
    WHERE h.user_id = ? AND h.is_active = 1
    ORDER BY h.created_at ASC
  `).all(today, session.userId) as Array<Record<string, unknown>>;

  // Calculate streaks for each habit
  const habitsWithStreaks = habits.map(habit => {
    const logs = db.prepare(
      'SELECT date, completed FROM habit_logs WHERE habit_id = ? ORDER BY date ASC'
    ).all(habit.id) as Array<{ date: string; completed: number }>;

    const streak = calculateStreak(logs, today);
    return { ...habit, streak: streak.current, longestStreak: streak.longest };
  });

  return jsonResponse({ habits: habitsWithStreaks });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { name, description, emoji, isShared } = await request.json();

  if (!name || name.trim().length === 0) {
    return errorResponse('습관 이름을 입력해주세요.', 400);
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO habits (user_id, name, description, emoji, is_shared) VALUES (?, ?, ?, ?, ?)'
  ).run(session.userId, name.trim(), description || '', emoji || '✅', isShared ? 1 : 0);

  return jsonResponse({
    habit: {
      id: result.lastInsertRowid,
      name: name.trim(),
      description: description || '',
      emoji: emoji || '✅',
      isShared: isShared ? 1 : 0,
      streak: 0,
    },
  }, 201);
}
