import { Link, useLocation } from 'react-router-dom';

function StumpsLogo() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 3 stumps */}
      <rect x="1"   y="6" width="2.5" height="17" rx="1.2" fill="currentColor" />
      <rect x="8.8" y="6" width="2.5" height="17" rx="1.2" fill="currentColor" />
      <rect x="16.5" y="6" width="2.5" height="17" rx="1.2" fill="currentColor" />
      {/* Bails */}
      <rect x="0"   y="4.5" width="8.5"  height="2.2" rx="1.1" fill="currentColor" />
      <rect x="11"  y="4.5" width="8.5"  height="2.2" rx="1.1" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const { pathname } = useLocation();

  function navClass(active: boolean) {
    return [
      'relative text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200',
      active ? 'text-[#C9A84C]' : 'text-[#5A8C70] hover:text-white',
    ].join(' ');
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#C9A84C]/25"
      style={{ background: '#0C2A17' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">

        {/* Wordmark */}
        <Link to="/" className="group flex flex-col items-center gap-0 select-none">
          <div className="flex items-center gap-2.5">
            <span
              className="font-display font-bold text-[17px] leading-none tracking-wider"
              style={{ color: '#C9A84C' }}
            >
              DADS
            </span>
            <span style={{ color: 'rgba(201,168,76,0.55)' }}>
              <StumpsLogo />
            </span>
            <span
              className="font-display font-bold text-[17px] leading-none tracking-wider text-white"
            >
              LADS
            </span>
          </div>
          <span
            className="font-scoreboard text-[9px] tracking-[0.32em] uppercase"
            style={{ color: '#4A7A5E' }}
          >
            Cricket League
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5 sm:gap-7">

          <Link to="/" className={navClass(pathname === '/')}>
            Matches
            {pathname === '/' && (
              <span className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 flex gap-[3px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-[4px] h-[4px] rounded-full"
                    style={{ background: '#C9A84C', opacity: 0.65 }}
                  />
                ))}
              </span>
            )}
          </Link>

          <Link to="/stats" className={navClass(pathname === '/stats')}>
            Stats
            {pathname === '/stats' && (
              <span className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 flex gap-[3px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-[4px] h-[4px] rounded-full"
                    style={{ background: '#C9A84C', opacity: 0.65 }}
                  />
                ))}
              </span>
            )}
          </Link>

          <Link
            to="/admin"
            className={[
              'relative overflow-hidden group/matchbtn text-[11px] font-bold tracking-[0.16em] uppercase px-4 py-[7px] border transition-all duration-200',
              pathname === '/admin'
                ? 'border-[#C9A84C] text-[#0C2A17] bg-[#C9A84C]'
                : 'border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]',
            ].join(' ')}
          >
            <span className="pointer-events-none absolute right-0 top-0 h-full w-[45%] translate-x-full transition-transform duration-500 ease-out group-hover/matchbtn:translate-x-0" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.45))' }} />
            <span className="pointer-events-none absolute left-0 top-0 h-full w-[45%] -translate-x-full transition-transform duration-500 ease-out group-hover/matchbtn:translate-x-0" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.45))' }} />
            <span className="pointer-events-none absolute left-0 top-0 w-full h-[65%] -translate-y-full transition-transform duration-500 ease-out group-hover/matchbtn:translate-y-0" style={{ background: 'linear-gradient(to top, transparent, rgba(201,168,76,0.45))' }} />
            <span className="pointer-events-none absolute left-0 bottom-0 w-full h-[65%] translate-y-full transition-transform duration-500 ease-out group-hover/matchbtn:translate-y-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.45))' }} />
            <span className="relative">+ Match</span>
          </Link>

        </nav>
      </div>
    </header>
  );
}
