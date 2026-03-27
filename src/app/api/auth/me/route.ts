import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const db = getDb();
    const user = db.prepare(
      'SELECT id, username, email, display_name, avatar_color, identity, onboarding_completed, created_at FROM users WHERE id = ?'
    ).get(session.userId) as { id: number; username: string; email: string; display_name: string; avatar_color: string; identity: string | null; onboarding_completed: number; created_at: string } | undefined;

    if (!user) return errorResponse('User not found', 404);

    return jsonResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarColor: user.avatar_color,
        identity: user.identity,
        onboardingCompleted: user.onboarding_completed,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logError('GET /api/auth/me', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { identity, onboardingCompleted } = body;

    const db = getDb();
    const updates: string[] = [];
    const values: unknown[] = [];

    if (identity !== undefined) {
      updates.push('identity = ?');
      values.push(identity);
    }
    if (onboardingCompleted !== undefined) {
      updates.push('onboarding_completed = ?');
      values.push(onboardingCompleted ? 1 : 0);
    }

    if (updates.length === 0) return errorResponse('업데이트할 항목이 없습니다.', 400);

    values.push(session.userId);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return jsonResponse({ message: '업데이트되었습니다.' });
  } catch (error) {
    logError('PUT /api/auth/me', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
