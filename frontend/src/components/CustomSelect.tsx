import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface Props {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  style,
}: Props) {
  const [open, setOpen]   = useState(false);
  const [rect, setRect]   = useState<DOMRect | null>(null);
  const triggerRef        = useRef<HTMLButtonElement>(null);
  const dropdownRef       = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(true);
  }

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;

    function onOutside(e: MouseEvent) {
      if (!triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onScroll(e: Event) {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }

    document.addEventListener('mousedown', onOutside);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full text-left flex items-center justify-between gap-2"
        style={{
          padding: '7px 10px',
          border: '1px solid #E8DFD0',
          borderBottom: `2px solid ${open ? '#FF4E00' : '#1a1208'}`,
          background: 'white',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: selected ? '#1a1208' : '#C8B090',
          outline: 'none',
          transition: 'border-color 150ms',
        }}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 180ms ease',
          }}
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="#7A6A50"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Portal dropdown — renders at body level to escape overflow:hidden */}
      {open && rect && createPortal(
        <div
          ref={dropdownRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top:   rect.bottom + 2,
            left:  rect.left,
            width: Math.max(rect.width, 180),
            zIndex: 9997,
            background: 'white',
            border: '1px solid #E8DFD0',
            borderTop: '2px solid #1a1208',
            boxShadow: '0 6px 24px rgba(26,18,8,0.13)',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {options.map((opt) => {
            const active = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FF4E00' : '#1a1208',
                  background: active ? 'rgba(255,78,0,0.05)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #F5EFE0',
                  outline: 'none',
                  transition: 'background 100ms',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = '#F5EFE0';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
