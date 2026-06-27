import { useState, useEffect } from 'react';

const START_DATE = new Date('2026-06-12T00:00:00');

function formatUptime(): string {
  const now = new Date();
  const diffMs = now.getTime() - START_DATE.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSecs / (3600 * 24));
  const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function useUptime(): string {
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const tick = () => setUptime(formatUptime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return uptime;
}
