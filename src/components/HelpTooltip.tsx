import { useState } from 'react';

type Props = { text: string };

export function HelpTooltip({ text }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Ayuda"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="w-3.5 h-3.5 rounded-full bg-white/10 text-[9px] leading-none text-slate-300 hover:bg-white/20 hover:text-white flex items-center justify-center font-bold"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 w-56 px-3 py-2 rounded-lg bg-bg-elevated border border-white/10 text-[11px] leading-snug text-slate-200 shadow-lg shadow-black/50 pointer-events-none"
        >
          {text}
        </span>
      )}
    </span>
  );
}
