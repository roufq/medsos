export default function VerifiedBadge({ size = 16, className = '' }) {
  return (
    <span
      className={`group/vb relative inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      title="Verified Account"
      aria-label="Verified Account"
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M19.998 3.094 24.638 0l2.972 5.15 5.432-1.024.756 5.565 5.565.756-1.024 5.432L40 19.998l-3.094 4.64 1.024 5.432-5.565.756-.756 5.565-5.432-1.024L19.998 40l-4.64-3.094-5.432 1.024-.756-5.565-5.565-.756 1.024-5.432L0 19.998l3.094-4.64-1.024-5.432 5.565-.756.756-5.565 5.432 1.024L19.998 3.094Z"
          fill="#0095F6"
        />
        <path
          d="M17.2 26.8 11.4 21l2.4-2.4 3.4 3.4 9-9 2.4 2.4-11.4 11.4Z"
          fill="#FFFFFF"
        />
      </svg>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white shadow-md opacity-0 transition-opacity duration-150 group-hover/vb:opacity-100 z-50"
      >
        Verified Account
      </span>
    </span>
  );
}
