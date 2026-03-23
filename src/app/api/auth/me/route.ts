import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return errorResponse('Unauthorized', 401);

  const db = getDb();
  const user = db.prepare(
    'SELECT id, username, email, display_name, avatar_color, created_at FROM users WHERE id = ?'
  ).get(session.userId) as { id: number; username: string; email: string; display_name: string; avatar_color: string; created_at: string } | undefined;

  if (!user) return errorResponse('User not found', 404);

  return jsonResponse({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarColor: user.avatar_color,
      createdAt: user.created_at,
    },
  });
}
