type LogoProps = {
  className?: string;
  withWordmark?: boolean;
  light?: boolean;
};

export default function Logo({
  className = "",
  withWordmark = true,
  light = false,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fcp-mark" x1="2" y1="2" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7ED321" />
            <stop offset="1" stopColor="#2EC4FF" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="36" height="36" rx="12" fill="url(#fcp-mark)" />
        <rect
          x="11"
          y="9"
          width="16"
          height="20"
          rx="8"
          transform="rotate(20 19 19)"
          fill="white"
          fillOpacity="0.92"
        />
        <rect x="12.2" y="17.5" width="13.6" height="3" rx="1.5" transform="rotate(20 19 19)" fill="#7ED321" />
      </svg>
      {withWordmark && (
        <span
          className={`font-display text-[1.05rem] font-bold leading-none tracking-tight ${
            light ? "text-white" : "text-ink"
          }`}
        >
          First Choice
          <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brand-aqua">
            Pharmacy
          </span>
        </span>
      )}
    </div>
  );
}
