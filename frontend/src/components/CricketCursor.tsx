import { useEffect, useRef, useState } from 'react';

export default function CricketCursor() {
  const [pos,       setPos]       = useState({ x: -200, y: -200 });
  const [visible,   setVisible]   = useState(false);
  const [spinning,  setSpinning]  = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [clicked,   setClicked]   = useState(false);

  const spinTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef   = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });

      if (!movedRef.current) {
        // First move after mount or navigation — snap visible immediately
        movedRef.current = true;
        setVisible(true);
      } else {
        setVisible(true);
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      setIsPointer(
        !!el?.closest('a, button, [role="button"], select, label, [tabindex], input, textarea'),
      );
    }

    function onEnter() {
      // Mouse re-enters window (e.g. after navigating back from another tab)
      setVisible(true);
    }

    function onLeave() {
      setVisible(false);
      setIsPointer(false);
    }

    function onVisibility() {
      if (document.hidden) {
        setVisible(false);
        setIsPointer(false);
      }
    }

    function onClick() {
      setClicked(true);
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => setClicked(false), 160);

      setSpinning(true);
      if (spinTimer.current) clearTimeout(spinTimer.current);
      spinTimer.current = setTimeout(() => setSpinning(false), 540);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onClick);
    document.documentElement.addEventListener('mouseenter', onEnter);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onClick);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      if (spinTimer.current)  clearTimeout(spinTimer.current);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const ballSize = 26;
  const ringSize = 46;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top:  0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        // CSS transition for smooth-enough movement without RAF complexity
        transform: `translate(${pos.x - ballSize / 2}px, ${pos.y - ballSize / 2}px)`,
        transition: visible ? 'transform 40ms linear, opacity 120ms ease' : 'opacity 120ms ease',
        opacity: visible ? 1 : 0,
        willChange: 'transform',
      }}
    >
      {/* Outer ring — appears on hover over interactive elements */}
      <div
        style={{
          position: 'absolute',
          top:  (ballSize - ringSize) / 2,
          left: (ballSize - ringSize) / 2,
          width:  ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: `1.5px solid ${isPointer ? 'rgba(201,168,76,0.75)' : 'rgba(192,57,43,0.3)'}`,
          transform: isPointer ? 'scale(1)' : 'scale(0.45)',
          opacity:   isPointer ? 1 : 0,
          transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease, border-color 150ms ease',
        }}
      />

      {/* Cricket ball */}
      <svg
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width:  ballSize,
          height: ballSize,
          display: 'block',
          animation: spinning ? 'seamSpin 0.52s cubic-bezier(0.22,1,0.36,1)' : 'none',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          transformOrigin: 'center',
          transform: clicked ? 'scale(0.75)' : 'scale(1)',
          transition: clicked
            ? 'transform 55ms ease-in'
            : 'transform 160ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <defs>
          <clipPath id="ball-clip">
            <circle cx="14" cy="14" r="12.6" />
          </clipPath>
        </defs>

        <circle cx="14" cy="14" r="13" fill="#C0392B" />
        <circle cx="14" cy="14" r="13" fill="none" stroke="#8B2015" strokeWidth="1" />
        <ellipse cx="9.5" cy="9" rx="4" ry="2.5" fill="white" opacity="0.20" transform="rotate(-30 9.5 9)" />

        <g clipPath="url(#ball-clip)">
          <path d="M 1 12 C 7 10.5, 21 10.5, 27 12"
            fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.90" />
          <path d="M 1 15.5 C 7 14, 21 14, 27 15.5"
            fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.90" />
          <path d="M 1 12 C 7 10.5, 21 10.5, 27 12"
            fill="none" stroke="rgba(255,215,200,0.5)" strokeWidth="0.7"
            strokeDasharray="2.5 2.0" strokeLinecap="round" />
          <path d="M 1 15.5 C 7 14, 21 14, 27 15.5"
            fill="none" stroke="rgba(255,215,200,0.5)" strokeWidth="0.7"
            strokeDasharray="2.5 2.0" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
