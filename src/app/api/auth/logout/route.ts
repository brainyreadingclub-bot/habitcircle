import { clearSessionCookie } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';
import { logError } from '@/lib/logger';

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonResponse({ message: '로그아웃 되었습니다.' });
  } catch (error) {
    logError('POST /api/auth/logout', error);
    return errorResponse('서버 오류가 발생했습니다.', 500);
  }
}
