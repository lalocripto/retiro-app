import type { YearProjection } from '../types';
import { formatCompact, formatCurrency, formatPercent } from '../utils/format';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

type Props = {
  projections: YearProjection[];
  withdrawalRate: number;
  inflation: number;
  initialCapital: number;
};

export function ResultsCards({ projections, withdrawalRate, inflation, initialCapital }: Props) {
  const final = projections[projections.length - 1];
  const horizon = final.year;
  const inflationFactor = Math.pow(1 + inflation / 100, horizon);

  const annualNominal = final.totalNominal * (withdrawalRate / 100);
  const monthlyNominal = annualNominal / 12;
  const annualPV = annualNominal / inflationFactor;
  const monthlyPV = annualPV / 12;

  const animatedNominal = useAnimatedNumber(final.totalNominal, 600);
  const animatedMonthlyNominal = useAnimatedNumber(monthlyNominal, 600);
  const animatedGain = useAnimatedNumber(final.cumulativeGain, 600);

  const gainPct =
    final.totalContributed + initialCapital > 0
      ? (final.cumulativeGain / (final.totalContributed + initialCapital)) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <HeroCard
        label="Valor nominal final"
        value={formatCompact(animatedNominal)}
        sub={`a ${horizon} años · ${formatCurrency(final.totalNominal)}`}
      />
      <HeroCard
        label={`Retiro mensual nominal @ ${withdrawalRate}%`}
        tone="sky"
        value={formatCompact(animatedMonthlyNominal)}
        sub={`${formatCurrency(monthlyNominal)} / mes en el año ${horizon}`}
      />
      <HeroCard
        label="Ganancia acumulada"
        tone="emerald"
        value={formatCompact(animatedGain)}
        sub={`${formatPercent(gainPct)} sobre lo aportado`}
      />

      <SmallCard
        label="Valor presente (hoy)"
        value={formatCompact(final.totalPresentValue)}
        sub={`descontado ${formatPercent(inflation)}/año`}
      />
      <SmallCard
        label="Retiro anual nominal"
        value={formatCompact(annualNominal)}
        sub={`en el año ${horizon}`}
      />
      <SmallCard
        label="Equivalente en poder de compra hoy"
        value={`${formatCompact(annualPV)} / año`}
        sub={`${formatCurrency(monthlyPV)} / mes`}
      />
    </div>
  );
}

function HeroCard({
  label,
  value,
  sub,
  tone = 'gold',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'gold' | 'sky' | 'emerald';
}) {
  const toneClass =
    tone === 'gold'
      ? 'text-gold-soft'
      : tone === 'sky'
        ? 'text-sky'
        : 'text-emerald-300';
  const ringClass =
    tone === 'gold'
      ? 'ring-1 ring-gold/20 shadow-glow'
      : tone === 'sky'
        ? 'ring-1 ring-sky/15'
        : 'ring-1 ring-emerald-400/15';
  return (
    <div className={`card p-5 ${ringClass}`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className={`num text-3xl md:text-4xl font-semibold ${toneClass} truncate`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-2">{sub}</div>}
    </div>
  );
}

function SmallCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3.5 bg-bg-elevated/60">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>
      <div className="num text-base md:text-lg font-medium text-slate-300 truncate">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
