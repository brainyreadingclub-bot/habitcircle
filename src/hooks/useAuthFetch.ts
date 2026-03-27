'use client';

import { useCallback } from 'react';

export function useAuthFetch() {
  return useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const res = await fetch(input, init);
    if (res.status === 401) {
      window.location.href = '/login';
      // Return a fake empty response to prevent callers from parsing the 401 body
      return new Response(JSON.stringify({}), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    return res;
  }, []);
}
