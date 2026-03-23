import { clearSessionCookie } from '@/lib/auth';
import { jsonResponse } from '@/lib/utils';

export async function POST() {
  await clearSessionCookie();
  return jsonResponse({ message: '로그아웃 되었습니다.' });
}
