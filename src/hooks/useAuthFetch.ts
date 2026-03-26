'use client';

import { useCallback } from 'react';

export function useAuthFetch() {
  return useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const res = await fetch(input, init);
    if (res.status === 401) {
      window.location.href = '/login';
    }
    return res;
  }, []);
}
