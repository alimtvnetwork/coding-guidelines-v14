const MAX_BADGE_COUNT = 99;

export function ResultCountBadge({ count }: { count: number }) {
  const display = count > MAX_BADGE_COUNT ? "99+" : count;

  return (
    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold tabular-nums">
      {display}
    </span>
  );
}
