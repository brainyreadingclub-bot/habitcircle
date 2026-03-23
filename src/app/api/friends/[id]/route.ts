import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Accept or decline friend request
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { action } = await request.json();

  if (!['accept', 'decline'].includes(action)) {
    return errorResponse('올바른 작업을 선택해주세요.', 400);
  }

  const db = getDb();

  const friendship = db.prepare(
    'SELECT id, addressee_id FROM friendships WHERE id = ? AND status = ?'
  ).get(id, 'pending') as { id: number; addressee_id: number } | undefined;

  if (!friendship) return errorResponse('요청을 찾을 수 없습니다.', 404);
  if (friendship.addressee_id !== session.userId) return errorResponse('권한이 없습니다.', 403);

  if (action === 'accept') {
    db.prepare('UPDATE friendships SET status = ? WHERE id = ?').run('accepted', id);
    return jsonResponse({ message: '친구 요청을 수락했습니다.' });
  } else {
    db.prepare('DELETE FROM friendships WHERE id = ?').run(id);
    return jsonResponse({ message: '친구 요청을 거절했습니다.' });
  }
}

// Remove friend
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const db = getDb();

  const result = db.prepare(`
    DELETE FROM friendships
    WHERE id = ? AND (requester_id = ? OR addressee_id = ?)
  `).run(id, session.userId, session.userId);

  if (result.changes === 0) return errorResponse('친구 관계를 찾을 수 없습니다.', 404);
  return jsonResponse({ message: '친구를 삭제했습니다.' });
}
