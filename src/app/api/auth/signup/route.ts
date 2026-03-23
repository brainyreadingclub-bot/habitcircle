import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

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

    const db = getDb();

    // Check if already exists — if so, try to log them in instead
    const existing = db.prepare(
      'SELECT id, username, email, display_name, avatar_color, password_hash FROM users WHERE username = ? OR email = ?'
    ).get(username, email) as { id: number; username: string; email: string; display_name: string; avatar_color: string; password_hash: string } | undefined;

    if (existing) {
      // If same email, try auto-login (handles the "created but cookie failed" case)
      if (existing.email === email) {
        try {
          const { verifyPassword } = await import('@/lib/auth');
          const valid = await verifyPassword(password, existing.password_hash);
          if (valid) {
            const token = await createToken(existing.id);
            await setSessionCookie(token);
            return jsonResponse({
              user: {
                id: existing.id,
                username: existing.username,
                email: existing.email,
                displayName: existing.display_name,
                avatarColor: existing.avatar_color,
              },
            }, 200);
          }
        } catch {
          // Fall through to error
        }
      }
      return errorResponse('이미 사용 중인 사용자명 또는 이메일입니다.', 409);
    }

    const passwordHash = await hashPassword(password);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash, display_name, avatar_color) VALUES (?, ?, ?, ?, ?)'
    ).run(username, email, passwordHash, displayName, avatarColor);

    const userId = result.lastInsertRowid as number;
    const token = await createToken(userId);
    await setSessionCookie(token);

    return jsonResponse({
      user: {
        id: userId,
        username,
        email,
        displayName,
        avatarColor,
      },
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('회원가입에 실패했습니다. 다시 시도해주세요.', 500);
  }
}
