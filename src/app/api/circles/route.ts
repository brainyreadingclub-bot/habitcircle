import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse, generateInviteCode } from '@/lib/utils';
import { logError } from '@/lib/logger';

// List my circles
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const db = getDb();

    const circles = db.prepare(`
      SELECT c.*,
             (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id) as member_count,
             cm.role
      FROM circles c
      JOIN circle_members cm ON cm.circle_id = c.id AND cm.user_id = ?
      ORDER BY c.created_at DESC
    `).all(session.userId);

    return jsonResponse({ circles });
  } catch (error) {
    logError('GET /api/circles', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

// Create a circle
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { name, description, emoji } = await request.json();

    if (!name || name.trim().length === 0) {
      return errorResponse('서클 이름을 입력해주세요.', 400);
    }

    const db = getDb();

    // Generate unique invite code
    let inviteCode: string;
    do {
      inviteCode = generateInviteCode();
    } while (db.prepare('SELECT id FROM circles WHERE invite_code = ?').get(inviteCode));

    const result = db.prepare(
      'INSERT INTO circles (name, description, emoji, invite_code, created_by) VALUES (?, ?, ?, ?, ?)'
    ).run(name.trim(), description || '', emoji || '👥', inviteCode, session.userId);

    // Add creator as owner
    db.prepare(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)'
    ).run(result.lastInsertRowid, session.userId, 'owner');

    return jsonResponse({
      circle: {
        id: result.lastInsertRowid,
        name: name.trim(),
        inviteCode,
      },
    }, 201);
  } catch (error) {
    logError('POST /api/circles', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
