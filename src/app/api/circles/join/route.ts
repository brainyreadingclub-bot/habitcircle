import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const { inviteCode } = await request.json();
    if (!inviteCode) return errorResponse('초대 코드를 입력해주세요.', 400);

    const db = getDb();

    const circle = db.prepare(
      'SELECT id, name FROM circles WHERE invite_code = ?'
    ).get(inviteCode.toUpperCase()) as { id: number; name: string } | undefined;

    if (!circle) return errorResponse('유효하지 않은 초대 코드입니다.', 404);

    // Check if already a member
    const existing = db.prepare(
      'SELECT id FROM circle_members WHERE circle_id = ? AND user_id = ?'
    ).get(circle.id, session.userId);

    if (existing) return errorResponse('이미 가입된 서클입니다.', 409);

    db.prepare(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)'
    ).run(circle.id, session.userId, 'member');

    return jsonResponse({
      message: `'${circle.name}' 서클에 가입했습니다!`,
      circleId: circle.id,
    }, 201);
  } catch (error) {
    logError('POST /api/circles/join', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
