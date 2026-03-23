import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const db = getDb();

  // Verify membership
  const member = db.prepare(
    'SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?'
  ).get(id, session.userId);

  if (!member) return errorResponse('서클에 가입되어 있지 않습니다.', 403);

  const circle = db.prepare('SELECT * FROM circles WHERE id = ?').get(id);
  if (!circle) return errorResponse('서클을 찾을 수 없습니다.', 404);

  const members = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_color, cm.role, cm.joined_at
    FROM circle_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.circle_id = ?
    ORDER BY cm.joined_at ASC
  `).all(id);

  const memberCount = members.length;

  return jsonResponse({ circle: { ...circle as Record<string, unknown>, memberCount }, members });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const db = getDb();

  const circle = db.prepare(
    'SELECT id FROM circles WHERE id = ? AND created_by = ?'
  ).get(id, session.userId);

  if (!circle) return errorResponse('서클을 삭제할 권한이 없습니다.', 403);

  db.prepare('DELETE FROM circles WHERE id = ?').run(id);
  return jsonResponse({ message: '서클이 삭제되었습니다.' });
}
