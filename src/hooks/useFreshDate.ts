'use client';

import { useState, useEffect } from 'react';

export function getKSTDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function useFreshDate(): string {
  const [dateStr, setDateStr] = useState(getKSTDateStr);

  useEffect(() => {
    function refresh() {
      setDateStr(getKSTDateStr());
    }

    // Timer to next midnight KST
    function scheduleNextMidnight() {
      const now = new Date();
      const kstOffset = 9 * 60; // KST = UTC+9
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const kstMinutes = (utcMinutes + kstOffset) % 1440;
      const minutesUntilMidnight = (1440 - kstMinutes) % 1440 || 1440;
      const msUntilMidnight = (minutesUntilMidnight * 60 - now.getUTCSeconds()) * 1000 - now.getUTCMilliseconds() + 500; // +500ms buffer

      return setTimeout(() => {
        refresh();
        timerId = scheduleNextMidnight();
      }, msUntilMidnight);
    }

    let timerId = scheduleNextMidnight();

    // Refresh on tab visibility change
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return dateStr;
}
