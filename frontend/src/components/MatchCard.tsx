import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';
import { formatDate, formatTime } from '../utils';

interface Props {
  match: Match;
  upcoming?: boolean;
  onAddStats?: () => void;
}

/** CSS-only cricket field as SVG overlay */
function CricketFieldOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 900 380"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Oval boundary */}
      <ellipse
        cx="450" cy="190"
        rx="420" ry="170"
        fill="none"
        stroke="rgba(201,168,76,0.07)"
        strokeWidth="2.5"
        strokeDasharray="10 7"
      />
      {/* 30-yard circle */}
      <ellipse
        cx="450" cy="190"
        rx="220" ry="130"
        fill="none"
        stroke="rgba(201,168,76,0.05)"
        strokeWidth="1.5"
      />
      {/* Pitch strip */}
      <rect
        x="418" y="70" width="64" height="240"
        rx="2"
        fill="rgba(201,168,76,0.055)"
        stroke="rgba(201,168,76,0.10)"
        strokeWidth="1"
      />
      {/* Bowling crease lines */}
      <line x1="408" y1="113" x2="492" y2="113" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5"/>
      <line x1="408" y1="267" x2="492" y2="267" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5"/>
      {/* Popping crease */}
      <line x1="408" y1="127" x2="492" y2="127" stroke="rgba(201,168,76,0.10)" strokeWidth="1"/>
      <line x1="408" y1="253" x2="492" y2="253" stroke="rgba(201,168,76,0.10)" strokeWidth="1"/>
      {/* Stumps — top end */}
      <line x1="440" y1="105" x2="440" y2="116" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="450" y1="105" x2="450" y2="116" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="460" y1="105" x2="460" y2="116" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="437" y1="107" x2="447" y2="107" stroke="rgba(201,168,76,0.22)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="453" y1="107" x2="463" y2="107" stroke="rgba(201,168,76,0.22)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Stumps — bottom end */}
      <line x1="440" y1="264" x2="440" y2="275" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="450" y1="264" x2="450" y2="275" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="460" y1="264" x2="460" y2="275" stroke="rgba(201,168,76,0.30)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="437" y1="266" x2="447" y2="266" stroke="rgba(201,168,76,0.22)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="453" y1="266" x2="463" y2="266" stroke="rgba(201,168,76,0.22)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function MatchCard({ match, upcoming = false, onAddStats }: Props) {
  const navigate = useNavigate();
  const hasTeams = match.teamA && match.teamB && match.teamA !== 'TBA';

  if (upcoming) {
    return (
      <div
        className="w-full overflow-hidden"
        style={{ borderBottom: '2px solid rgba(201,168,76,0.5)' }}
      >
        {/* Main clickable hero */}
        <button
          onClick={() => navigate(`/match/${match.id}`)}
          className="w-full text-left relative group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-inset"
          style={{ minHeight: 220 }}
        >
          {/* Gold shimmer from left on hover */}
          <span
            className="pointer-events-none absolute left-0 top-0 h-full w-[32%] -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0 z-[5]"
            style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.18), transparent)' }}
          />

          {/* Cricket field bg */}
          <div
            className="absolute inset-0 transition-all duration-700 group-hover:scale-[1.015]"
            style={{
              background: 'radial-gradient(ellipse 110% 70% at 50% 115%, rgba(27,94,59,0.75) 0%, transparent 62%), radial-gradient(ellipse 75% 55% at 50% 50%, #163D25 0%, #0C2A17 75%), #0C2A17',
            }}
          />
          <CricketFieldOverlay />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C2A17]/60 via-transparent to-[#0C2A17]/40 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
            {/* Pulse label */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#C9A84C', animation: 'pulseGold 2s ease infinite' }}
              />
              <span
                className="font-scoreboard text-base tracking-[0.35em]"
                style={{ color: '#C9A84C' }}
              >
                Next Match
              </span>
            </div>

            {/* Teams */}
            {hasTeams ? (
              <div className="flex items-center gap-4 sm:gap-10 mb-6">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-scoreboard leading-none tracking-wide truncate"
                    style={{ fontSize: 'clamp(36px, 6vw, 60px)', color: '#7EC8E8' }}
                  >
                    {match.teamA}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center">
                  <span
                    className="font-scoreboard leading-none"
                    style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', color: '#FF4E00' }}
                  >
                    VS
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p
                    className="font-scoreboard leading-none tracking-wide truncate"
                    style={{ fontSize: 'clamp(36px, 6vw, 60px)', color: '#F0E6D3' }}
                  >
                    {match.teamB}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-display font-bold italic text-white mb-6" style={{ fontSize: 'clamp(28px,5vw,48px)' }}>
                Upcoming Match
              </p>
            )}

            {/* Meta info */}
            <div
              className="font-scoreboard text-xl tracking-wide flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <span>{formatDate(match.startTime)}</span>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
              <span>{formatTime(match.startTime)}</span>
              {match.location && (
                <>
                  <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
                  <span>{match.location}</span>
                </>
              )}
              {match.pitch != null && (
                <>
                  <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
                  <span>Pitch {match.pitch}</span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <span
            className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-10 text-2xl transition-all duration-200 group-hover:translate-x-1"
            style={{ color: 'rgba(201,168,76,0.35)' }}
            aria-hidden="true"
          >
            →
          </span>
        </button>

        {/* Add stats strip */}
        {onAddStats && (
          <div
            className="flex items-center justify-between px-6 sm:px-10 py-3"
            style={{
              borderTop: '1px solid rgba(201,168,76,0.15)',
              background: 'rgba(12,42,23,0.9)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-scoreboard text-sm tracking-[0.25em]"
                style={{ color: '#4A7A5E' }}
              >
                Match played?
              </span>
              {/* Over dots */}
              <span className="hidden sm:flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-[5px] h-[5px] rounded-full"
                    style={{ background: '#C9A84C', opacity: 0.25 }}
                  />
                ))}
              </span>
            </div>
            <button
              onClick={onAddStats}
              className="btn-primary relative overflow-hidden group/addbtn"
            >
              <span className="pointer-events-none absolute right-0 top-0 h-full w-[45%] translate-x-full transition-transform duration-500 ease-out group-hover/addbtn:translate-x-0" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.45))' }} />
              <span className="pointer-events-none absolute left-0 top-0 h-full w-[45%] -translate-x-full transition-transform duration-500 ease-out group-hover/addbtn:translate-x-0" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.45))' }} />
              <span className="pointer-events-none absolute left-0 top-0 w-full h-[65%] -translate-y-full transition-transform duration-500 ease-out group-hover/addbtn:translate-y-0" style={{ background: 'linear-gradient(to top, transparent, rgba(201,168,76,0.45))' }} />
              <span className="pointer-events-none absolute left-0 bottom-0 w-full h-[65%] translate-y-full transition-transform duration-500 ease-out group-hover/addbtn:translate-y-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.45))' }} />
              <span className="relative">+ Add Stats &amp; Result</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Past match row ────────────────────────────────────────────
  return (
    <button
      onClick={() => navigate(`/match/${match.id}`)}
      className="match-row w-full text-left group relative overflow-hidden transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-inset"
      style={{ borderBottom: '1px solid #E8DFD0' }}
    >
      {/* Gold shimmer from left */}
      <span
        className="pointer-events-none absolute left-0 top-0 h-full w-[32%] -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0 z-0"
        style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.18), transparent)' }}
      />
      <div
        className="relative z-10 flex items-center gap-3 px-5 sm:px-6 py-[14px] group-hover:bg-[#F5EFE0]/60 transition-colors duration-150"
      >
        {/* Date */}
        <span
          className="shrink-0 w-28 font-scoreboard text-[15px] leading-none tabular-nums"
          style={{ color: '#A08060' }}
        >
          {formatDate(match.startTime)}
        </span>

        {/* Teams */}
        <span className="flex-1 text-sm font-semibold text-left" style={{ color: '#1a1208' }}>
          {hasTeams ? (
            <>
              {match.teamA}
              {' '}
              <span style={{ color: '#C9A84C', fontWeight: 400 }}>v</span>
              {' '}
              {match.teamB}
            </>
          ) : (
            <span style={{ color: '#a08060', fontStyle: 'italic' }}>Teams TBA</span>
          )}
        </span>

        {/* Result pill */}
        {match.result && (
          <span
            className="shrink-0 hidden sm:inline-block text-[11px] font-medium px-2.5 py-0.5 tracking-wide"
            style={{
              border: '1px solid rgba(27,94,59,0.3)',
              color: '#1B5E3B',
              background: 'rgba(27,94,59,0.07)',
            }}
          >
            {match.result}
          </span>
        )}

        {/* Arrow */}
        <span
          className="shrink-0 text-sm transition-all duration-150 group-hover:translate-x-0.5"
          style={{ color: '#C8B090' }}
          aria-hidden="true"
        >
          →
        </span>
      </div>

      {/* Mobile result */}
      {match.result && (
        <p className="sm:hidden pb-3 pl-5 text-xs" style={{ color: '#1B5E3B' }}>
          {match.result}
        </p>
      )}
    </button>
  );
}
