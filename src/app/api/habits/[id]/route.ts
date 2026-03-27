import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, todayStr } from '@/lib/utils';
import { calculateStreak, getCompletionRate } from '@/lib/streaks';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { name, description, emoji, isShared, isActive } = await request.json();
  const db = getDb();

  const habit = db.prepare(
    'SELECT id FROM habits WHERE id = ? AND user_id = ?'
  ).get(id, session.userId);

  if (!habit) return errorResponse('습관을 찾을 수 없습니다.', 404);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (emoji !== undefined) { updates.push('emoji = ?'); values.push(emoji); }
  if (isShared !== undefined) { updates.push('is_shared = ?'); values.push(isShared ? 1 : 0); }
  if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

  if (updates.length === 0) return errorResponse('수정할 내용이 없습니다.', 400);

  updates.push("updated_at = datetime('now')");
  values.push(id, session.userId);

  db.prepare(
    `UPDATE habits SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).run(...values);

  return jsonResponse({ message: '습관이 수정되었습니다.' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const db = getDb();

  // Soft delete: mark as inactive instead of hard delete (preserves logs)
  const result = db.prepare(
    'UPDATE habits SET is_active = 0 WHERE id = ? AND user_id = ?'
  ).run(id, session.userId);

  if (result.changes === 0) return errorResponse('습관을 찾을 수 없습니다.', 404);
  return jsonResponse({ message: '습관이 삭제되었습니다.' });
}
