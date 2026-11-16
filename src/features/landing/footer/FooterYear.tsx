'use client';

import { useEffect, useState } from 'react';

export function FooterYear({ initialYear }: { initialYear: number }) {
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setYear(new Date().getFullYear()),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return year;
}
