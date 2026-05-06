import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';
import type { Player } from '../types';
import { createPlayer } from '../api';

interface Props {
  players: Player[];
  value: number;                      // 0 = nothing selected
  onChange: (playerId: number) => void;
  onNewPlayer?: (p: Player) => void;
}

export default function PlayerCombobox({ players, value, onChange, onNewPlayer }: Props) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [creating, setCreating] = useState(false);
  const [err,      setErr]      = useState('');
  const [pos,      setPos]      = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const selected     = players.find((p) => p.id === value);

  const q        = query.trim();
  const filtered = q
    ? players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : players;
  const exactMatch = players.some((p) => p.name.toLowerCase() === q.toLowerCase());
  const showAdd    = q.length >= 2 && !exactMatch;

  function calcPos() {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 2, left: r.left, width: Math.max(r.width, 180) });
  }

  function handleFocus() {
    calcPos();
    setQuery('');
    setOpen(true);
  }

  // Delay close so onMouseDown on options fires first
  function handleBlur() {
    setTimeout(() => {
      setOpen(false);
      setQuery('');
      setErr('');
    }, 150);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setErr('');
    if (!open) { calcPos(); setOpen(true); }
  }

  // Use onMouseDown + e.preventDefault() so input doesn't blur before we act
  function pickPlayer(e: React.MouseEvent, p: Player) {
    e.preventDefault();
    onChange(p.id);
    setQuery('');
    setOpen(false);
  }

  async function addPlayer(e: React.MouseEvent) {
    e.preventDefault();
    if (!q || creating) return;
    setCreating(true);
    setErr('');
    try {
      const p = await createPlayer(q);
      onChange(p.id);
      onNewPlayer?.(p);
      setQuery('');
      setOpen(false);
    } catch {
      setErr('Failed to add player');
    } finally {
      setCreating(false);
    }
  }

  const displayValue = open ? query : (selected?.name ?? '');

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 140 }}>
      <input
        type="text"
        value={displayValue}
        placeholder={open ? 'Search or add…' : 'Select…'}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '7px 10px',
          border: '1px solid #E8DFD0',
          borderBottom: `2px solid ${open ? '#FF4E00' : '#1a1208'}`,
          background: 'white',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: '#1a1208',
          outline: 'none',
        }}
      />

      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            top:    pos.top,
            left:   pos.left,
            width:  pos.width,
            zIndex: 9999,
            background: 'white',
            border: '1px solid #E8DFD0',
            borderTop: '2px solid #1a1208',
            boxShadow: '0 8px 28px rgba(26,18,8,0.14)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 && !showAdd && (
            <p style={{ padding: '10px 12px', fontSize: 12, color: '#A08060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              No players found
            </p>
          )}

          {filtered.map((p) => {
            const active = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => pickPlayer(e, p)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FF4E00' : '#1a1208',
                  background: active ? 'rgba(255,78,0,0.05)' : 'white',
                  border: 'none',
                  borderBottom: '1px solid #F5EFE0',
                  outline: 'none',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F5EFE0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'rgba(255,78,0,0.05)' : 'white'; }}
              >
                {q ? highlight(p.name, q) : p.name}
              </button>
            );
          })}

          {showAdd && (
            <button
              type="button"
              onMouseDown={addPlayer}
              disabled={creating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '9px 12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: creating ? '#A08060' : '#1B5E3B',
                background: 'rgba(27,94,59,0.06)',
                border: 'none',
                borderTop: filtered.length > 0 ? '1px solid #E8DFD0' : 'none',
                outline: 'none',
              }}
              onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = 'rgba(27,94,59,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(27,94,59,0.06)'; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              {creating ? `Adding "${q}"…` : `Add "${q}"`}
            </button>
          )}

          {err && (
            <p style={{ padding: '6px 12px', fontSize: 11, color: '#EF4444', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              {err}
            </p>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

function highlight(name: string, q: string): React.ReactNode {
  const i = name.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return name;
  return (
    <>
      {name.slice(0, i)}
      <strong style={{ color: '#FF4E00' }}>{name.slice(i, i + q.length)}</strong>
      {name.slice(i + q.length)}
    </>
  );
}
