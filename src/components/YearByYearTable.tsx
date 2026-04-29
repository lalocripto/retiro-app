import { useState } from 'react';
import type { YearProjection } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';

type Props = {
  projections: YearProjection[];
};

export function YearByYearTable({ projections }: Props) {
  const [expanded, setExpanded] = useState(false);

  const exportCSV = () => {
    const header = [
      'Año',
      'Edad',
      'Valor nominal',
      'Valor presente',
      'Aportado este año',
      'Total aportado',
      'Ganancia acumulada',
      '% crecimiento',
    ].join(',');
    const rows = projections.map((p) =>
      [
        p.year,
        p.age,
        round(p.totalNominal),
        round(p.totalPresentValue),
        round(p.contributedThisYear),
        round(p.totalContributed),
        round(p.cumulativeGain),
        p.yearGrowthPct.toFixed(2),
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retiro-proyeccion-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 heading-serif text-base text-slate-100 hover:text-gold-soft transition-colors"
        >
          <span className={`inline-block transition-transform ${expanded ? 'rotate-90' : ''}`}>▸</span>
          Proyección año a año
          <span className="text-[10px] text-slate-500 font-sans font-normal">
            ({projections.length} filas)
          </span>
        </button>
        <button type="button" onClick={exportCSV} className="btn-secondary text-xs">
          ↓ Exportar CSV
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/5 max-h-[480px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-elevated/95 backdrop-blur z-10">
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                <Th>Año</Th>
                <Th>Edad</Th>
                <Th align="right">Valor nominal</Th>
                <Th align="right">Valor presente</Th>
                <Th align="right">Aportado año</Th>
                <Th align="right">Total aportado</Th>
                <Th align="right">Ganancia acum.</Th>
                <Th align="right">% año</Th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year} className="border-t border-white/5 hover:bg-bg-hover/40">
                  <Td>{p.year}</Td>
                  <Td>{p.age}</Td>
                  <Td align="right" className="text-gold-soft">{formatCurrency(p.totalNominal)}</Td>
                  <Td align="right" className="text-sky">{formatCurrency(p.totalPresentValue)}</Td>
                  <Td align="right">{formatCurrency(p.contributedThisYear)}</Td>
                  <Td align="right">{formatCurrency(p.totalContributed)}</Td>
                  <Td align="right" className={p.cumulativeGain >= 0 ? 'text-emerald-300' : 'text-rose'}>
                    {formatCurrency(p.cumulativeGain)}
                  </Td>
                  <Td align="right" className={p.yearGrowthPct >= 0 ? 'text-emerald-300' : 'text-rose'}>
                    {p.year === 0 ? '—' : formatPercent(p.yearGrowthPct, 2)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th className={`px-3 py-2 font-medium text-${align}`}>{children}</th>;
}

function Td({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 num text-${align} ${className}`}>{children}</td>
  );
}

function round(n: number): number {
  return Math.round(n);
}
