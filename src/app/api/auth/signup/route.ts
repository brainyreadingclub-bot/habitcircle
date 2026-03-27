import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, displayName } = body;

    if (!username || !email || !password || !displayName) {
      return errorResponse('모든 필드를 입력해주세요.', 400);
    }

    if (typeof username !== 'string' || username.length > 50) {
      return errorResponse('사용자명은 50자 이하여야 합니다.', 400);
    }
    if (typeof email !== 'string' || email.length > 200) {
      return errorResponse('이메일이 너무 깁니다.', 400);
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return errorResponse('비밀번호는 6~72자여야 합니다.', 400);
    }
    if (typeof displayName !== 'string' || displayName.length > 100) {
      return errorResponse('표시 이름은 100자 이하여야 합니다.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const db = getDb();

    const existing = db.prepare(
      'SELECT id FROM users WHERE username = ? OR LOWER(email) = ?'
    ).get(username, normalizedEmail);

    if (existing) {
      return errorResponse('이미 사용 중인 사용자명 또는 이메일입니다.', 409);
    }

    const passwordHash = await hashPassword(password);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash, display_name, avatar_color) VALUES (?, ?, ?, ?, ?)'
    ).run(username, normalizedEmail, passwordHash, displayName, avatarColor);

    const userId = result.lastInsertRowid as number;
    const token = await createToken(userId);
    await setSessionCookie(token);

    return jsonResponse({
      user: {
        id: userId,
        username,
        email: normalizedEmail,
        displayName,
        avatarColor,
      },
    }, 201);
  } catch (error) {
    logError('POST /api/auth/signup', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
