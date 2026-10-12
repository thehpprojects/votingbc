// ======================================
// VoteChain Logo
// ======================================

export default function Logo({
  className = "h-9 w-9",
  textClassName = "",
  darkBackground = false,
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-label="VoteChain logo"
        role="img"
      >
        <defs>
          <linearGradient id="vc-g" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#vc-g)" />

        <path
          d="M24 10l9 6.4v6.2l-9 6.4-9-6.4v-6.2l9-6.4z"
          stroke="white"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        <path
          d="M15 27l9 6.4 9-6.4"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M15 33.5l9 6.4 9-6.4"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="24" cy="16.2" r="2.2" fill="white" />
      </svg>

      <span
        className={`font-display text-xl font-bold tracking-tight ${
          darkBackground ? "text-white" : "text-slate-900 dark:text-white"
        } ${textClassName}`}
      >
        <span
          className={
            darkBackground ? "text-white" : "text-slate-900 dark:text-white"
          }
        >
          Vote
        </span>

        <span className="text-gradient">Chain</span>
      </span>
    </span>
  );
}
