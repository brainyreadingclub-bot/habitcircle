import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('이메일과 비밀번호를 입력해주세요.', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const db = getDb();
    const user = db.prepare(
      'SELECT id, username, email, password_hash, display_name, avatar_color FROM users WHERE LOWER(email) = ?'
    ).get(normalizedEmail) as { id: number; username: string; email: string; password_hash: string; display_name: string; avatar_color: string } | undefined;

    if (!user) {
      return errorResponse('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return errorResponse('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const token = await createToken(user.id);
    await setSessionCookie(token);

    return jsonResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarColor: user.avatar_color,
      },
    });
  } catch (error) {
    logError('POST /api/auth/login', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
