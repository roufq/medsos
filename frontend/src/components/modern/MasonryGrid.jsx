import { useEffect, useState } from 'react';

const getCols = (w) => (w <= 767 ? 2 : w <= 900 ? 3 : w <= 1100 ? 4 : w <= 1350 ? 5 : 6);

export default function MasonryGrid({ items, renderItem, className = '' }) {
  const [cols, setCols] = useState(() => (typeof window === 'undefined' ? 6 : getCols(window.innerWidth)));

  useEffect(() => {
    const onResize = () => setCols(getCols(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const buckets = Array.from({ length: cols }, (_, c) => items.filter((_, i) => i % cols === c));

  return (
    <div
      className={`grid items-start gap-3 md:gap-[14px] ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {buckets.map((colItems, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4 md:gap-5 min-w-0">
          {colItems.map((item, idx) => renderItem(item, idx))}
        </div>
      ))}
    </div>
  );
}
