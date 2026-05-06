export default function CricketBatBg() {
  const BAT_PATH = "M -50 0 L 50 0 L 56 350 C 75 425, 180 470, 180 510 L 180 1340 Q 180 1420, 130 1420 L -130 1420 Q -180 1420, -180 1340 L -180 510 C -180 470, -75 425, -56 350 Z";

  const gripLines = Array.from({ length: 22 }, (_, k) => {
    const b = k * 30 - 60;
    return <line key={k} x1="-60" y1={b + 110} x2="60" y2={b} />;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMinYMin slice"
      >
        <defs>
          <clipPath id="bat-clip">
            <path d={BAT_PATH} />
          </clipPath>
          <clipPath id="handle-clip">
            <rect x="-60" y="120" width="120" height="230" />
          </clipPath>
        </defs>

        <g transform="translate(-100, -150) rotate(-40)">

          {/* Base silhouette */}
          <path fill="#0C2A17" opacity="0.065" d={BAT_PATH} />

          {/* Edge shadow on bottom/lower side only */}
          <rect x="-180" y="0" width="42" height="1420" fill="#0C2A17" opacity="0.04" clipPath="url(#bat-clip)" />

          {/* Handle grip wrap lines (y=120–350) */}
          <g clipPath="url(#bat-clip)">
            <g clipPath="url(#handle-clip)" stroke="#0C2A17" strokeWidth="5" opacity="0.05">
              {gripLines}
            </g>
          </g>

        </g>
      </svg>
    </div>
  );
}
