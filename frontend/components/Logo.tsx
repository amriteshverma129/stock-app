"use client";

export function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chart bars with gradient */}
      <rect x="3" y="16" width="3" height="8" rx="1" fill="url(#gradient1)" />
      <rect x="8" y="12" width="3" height="12" rx="1" fill="url(#gradient2)" />
      <rect x="13" y="8" width="3" height="16" rx="1" fill="url(#gradient3)" />
      <rect x="18" y="10" width="3" height="14" rx="1" fill="url(#gradient2)" />
      <rect x="23" y="14" width="3" height="10" rx="1" fill="url(#gradient1)" />

      {/* Trend line */}
      <path
        d="M 4.5 18 L 9.5 14 L 14.5 9 L 19.5 12 L 24.5 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Alternative: Glowing neon style
export function LogoNeon() {
  return (
    <div className="relative">
      <div className="flex items-end gap-[2px]">
        {[7, 9, 11, 9, 6, 7].map((height, i) => {
          const isCenter = i === 2;
          const color =
            i < 2
              ? "from-cyan-500 to-blue-500"
              : i < 4
              ? "from-purple-500 to-pink-500"
              : "from-blue-500 to-cyan-500";

          return (
            <div
              key={i}
              className={`w-1.5 bg-gradient-to-t ${color} rounded-t-sm ${
                isCenter ? "shadow-[0_0_15px_rgba(168,85,247,0.6)]" : ""
              }`}
              style={{ height: `${height * 4}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Alternative: Minimalist geometric
export function LogoMinimal() {
  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-[2px]">
        <div className="flex gap-[2px]">
          <div className="w-1 h-1 bg-blue-500 rounded-sm"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-sm"></div>
          <div className="w-1 h-1 bg-purple-500 rounded-sm"></div>
        </div>
        <div className="flex gap-[2px]">
          <div className="w-1 h-1 bg-purple-400 rounded-sm"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-sm"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

// Alternative: Circuit board style
export function LogoCircuit() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {/* S */}
      <path
        d="M2 20 L2 14 L6 14"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* H */}
      <path
        d="M8 20 L8 12 M8 16 L12 16 M12 20 L12 12"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* A */}
      <path
        d="M14 20 L16 8 L18 20 M15 14 L17 14"
        stroke="#a855f7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* H */}
      <path
        d="M20 20 L20 12 M20 16 L24 16 M24 20 L24 12"
        stroke="#c084fc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* I */}
      <path
        d="M26 20 L26 12"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* D */}
      <path
        d="M28 20 L28 12 L30 14 L30 18 Z"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Connecting nodes */}
      <circle cx="2" cy="14" r="1.5" fill="#3b82f6" />
      <circle cx="16" cy="8" r="2" fill="#a855f7" className="animate-pulse" />
      <circle cx="30" cy="16" r="1.5" fill="#3b82f6" />
    </svg>
  );
}

// Stock ticker style (subtle text)
export function LogoTicker() {
  return (
    <div className="font-mono">
      <div className="flex items-baseline gap-0.5">
        <span className="text-[10px] font-bold text-blue-400">S</span>
        <span className="text-[10px] font-bold text-blue-400">H</span>
        <span className="text-[10px] font-bold text-purple-400">A</span>
        <span className="text-[10px] font-bold text-purple-400">H</span>
        <span className="text-[10px] font-bold text-blue-400">I</span>
        <span className="text-[10px] font-bold text-blue-400">D</span>
      </div>
      <div className="flex gap-0.5 mt-0.5">
        <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
    </div>
  );
}
