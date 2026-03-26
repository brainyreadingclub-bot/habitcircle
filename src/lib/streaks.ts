export interface HabitLog {
  date: string;
  completed: number;
}

function toDateStr(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00+09:00');
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function calculateStreak(logs: HabitLog[], today?: string): { current: number; longest: number } {
  if (logs.length === 0) return { current: 0, longest: 0 };

  const completedDates = new Set(
    logs.filter(l => l.completed).map(l => l.date)
  );

  const todayStr = today || toDateStr(new Date());

  // Current streak: count backwards from today (or yesterday if today not done)
  let current = 0;
  let checkDate = todayStr;

  if (!completedDates.has(checkDate)) {
    checkDate = addDays(checkDate, -1);
  }

  while (completedDates.has(checkDate)) {
    current++;
    checkDate = addDays(checkDate, -1);
  }

  // Longest streak: scan all dates
  const sortedDates = Array.from(completedDates).sort();
  let longest = 0;
  let run = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const expected = addDays(sortedDates[i - 1], 1);
    if (sortedDates[i] === expected) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run, current);

  return { current, longest };
}

export function getCompletionRate(logs: HabitLog[], days: number, today?: string): number {
  const todayStr = today || toDateStr(new Date());
  const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date));

  let completed = 0;
  for (let i = 0; i < days; i++) {
    const date = addDays(todayStr, -i);
    if (completedDates.has(date)) completed++;
  }

  return days > 0 ? Math.round((completed / days) * 100) : 0;
}
