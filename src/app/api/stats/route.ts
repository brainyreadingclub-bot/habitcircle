import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, todayStr } from '@/lib/utils';
import { calculateStreak, getCompletionRate } from '@/lib/streaks';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const db = getDb();
  const today = todayStr();

  // Active habits count
  const habitCount = (db.prepare(
    'SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND is_active = 1'
  ).get(session.userId) as { count: number }).count;

  // Total completions
  const totalCompletions = (db.prepare(
    'SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ? AND completed = 1'
  ).get(session.userId) as { count: number }).count;

  // Best streak across all habits
  const habits = db.prepare(
    'SELECT id, name, emoji FROM habits WHERE user_id = ? AND is_active = 1'
  ).all(session.userId) as Array<{ id: number; name: string; emoji: string }>;

  let bestStreak = { current: 0, longest: 0, habitName: '', habitEmoji: '' };

  const habitsWithStreaks = habits.map(habit => {
    const logs = db.prepare(
      'SELECT date, completed FROM habit_logs WHERE habit_id = ? ORDER BY date ASC'
    ).all(habit.id) as Array<{ date: string; completed: number }>;

    const streak = calculateStreak(logs, today);
    const rate7 = getCompletionRate(logs, 7, today);

    if (streak.current > bestStreak.current) {
      bestStreak = { ...streak, habitName: habit.name, habitEmoji: habit.emoji };
    }

    return { ...habit, streak: streak.current, longestStreak: streak.longest, completionRate7: rate7 };
  });

  // Friends count
  const friendCount = (db.prepare(`
    SELECT COUNT(*) as count FROM friendships
    WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
  `).get(session.userId, session.userId) as { count: number }).count;

  // Circles count
  const circleCount = (db.prepare(
    'SELECT COUNT(*) as count FROM circle_members WHERE user_id = ?'
  ).get(session.userId) as { count: number }).count;

  // Days since signup
  const user = db.prepare(
    'SELECT created_at FROM users WHERE id = ?'
  ).get(session.userId) as { created_at: string };

  const daysSinceJoin = Math.floor(
    (new Date(today).getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return jsonResponse({
    habitCount,
    totalCompletions,
    bestStreak,
    friendCount,
    circleCount,
    daysSinceJoin,
    habits: habitsWithStreaks,
  });
}
