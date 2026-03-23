import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, todayStr } from '@/lib/utils';

// Get friends list + pending requests
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const db = getDb();
  const today = todayStr();

  // Accepted friends
  const friends = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_color,
           (SELECT COUNT(*) FROM habit_logs hl
            JOIN habits h ON h.id = hl.habit_id
            WHERE h.user_id = u.id AND hl.date = ?) as completed_today,
           (SELECT COUNT(*) FROM habits h
            WHERE h.user_id = u.id AND h.is_active = 1) as total_habits
    FROM users u
    WHERE u.id IN (
      SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END
      FROM friendships
      WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
    )
  `).all(today, session.userId, session.userId, session.userId);

  // Pending requests (received)
  const pendingReceived = db.prepare(`
    SELECT f.id as friendship_id, u.id, u.username, u.display_name, u.avatar_color, f.created_at
    FROM friendships f
    JOIN users u ON u.id = f.requester_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
  `).all(session.userId);

  // Pending requests (sent)
  const pendingSent = db.prepare(`
    SELECT f.id as friendship_id, u.id, u.username, u.display_name, u.avatar_color, f.created_at
    FROM friendships f
    JOIN users u ON u.id = f.addressee_id
    WHERE f.requester_id = ? AND f.status = 'pending'
  `).all(session.userId);

  return jsonResponse({ friends, pendingReceived, pendingSent });
}

// Send friend request
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { username } = await request.json();
  if (!username) return errorResponse('사용자명을 입력해주세요.', 400);

  const db = getDb();

  const targetUser = db.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).get(username) as { id: number } | undefined;

  if (!targetUser) return errorResponse('해당 사용자를 찾을 수 없습니다.', 404);
  if (targetUser.id === session.userId) return errorResponse('자기 자신에게는 요청할 수 없습니다.', 400);

  // Check existing friendship
  const existing = db.prepare(`
    SELECT id, status FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
  `).get(session.userId, targetUser.id, targetUser.id, session.userId) as { id: number; status: string } | undefined;

  if (existing) {
    if (existing.status === 'accepted') return errorResponse('이미 친구입니다.', 409);
    if (existing.status === 'pending') return errorResponse('이미 요청이 보내졌습니다.', 409);
  }

  db.prepare(
    'INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)'
  ).run(session.userId, targetUser.id);

  return jsonResponse({ message: '친구 요청을 보냈습니다.' }, 201);
}
