import { Box } from "@mui/material";

/** Decorative office-campus illustration for the left panel */
export default function BuildingArt() {
  return (
    <Box sx={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "44%", pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 640 340" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fcbff" />
            <stop offset="1" stopColor="#e3f0ff" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f9bf0" />
            <stop offset="1" stopColor="#1b4fae" />
          </linearGradient>
        </defs>
        <path d="M0 70C110 10 300 -10 430 60C560 130 640 240 600 340H0Z" fill="url(#sky)" />
        <rect x="46" y="136" width="222" height="178" fill="#eef3fb" />
        {Array.from({ length: 7 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => (
            <rect key={`a${r}-${c}`} x={60 + c * 22} y={150 + r * 22} width="16" height="14" fill="url(#glass)" />
          ))
        )}
        <rect x="270" y="110" width="84" height="204" fill="#f4f7fc" />
        {Array.from({ length: 8 }, (_, r) => (
          <rect key={`m${r}`} x="282" y={124 + r * 22} width="60" height="14" fill="url(#glass)" />
        ))}
        <rect x="356" y="190" width="110" height="124" fill="#e8eff9" />
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <rect key={`b${r}-${c}`} x={366 + c * 25} y={202 + r * 22} width="18" height="14" fill="url(#glass)" />
          ))
        )}
        <rect x="0" y="312" width="640" height="28" fill="#6fae5a" />
        {[120, 190, 300, 420, 520].map((x, i) => (
          <g key={x}>
            <rect x={x - 3} y="290" width="6" height="26" fill="#5a4a3a" />
            <circle cx={x} cy={280 - (i % 2) * 8} r="22" fill="#3f8f3c" />
            <circle cx={x + 12} cy={290 - (i % 2) * 8} r="16" fill="#4fa047" />
          </g>
        ))}
      </svg>
    </Box>
  );
}
