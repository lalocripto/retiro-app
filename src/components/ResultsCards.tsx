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
  const annualPV = annualNominal / inflationFactor;
  const monthlyPV = annualPV / 12;

  const gainPct = final.totalContributed + initialCapital > 0
    ? (final.cumulativeGain / (final.totalContributed + initialCapital)) * 100
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card
        label="Valor nominal final"
        value={final.totalNominal}
        format="compact"
        tone="gold"
        sub={`a ${horizon} años`}
      />
      <Card
        label="Valor presente neto"
        value={final.totalPresentValue}
        format="compact"
        tone="sky"
        sub={`descontado ${formatPercent(inflation)}/año`}
      />
      <Card
        label="Retiro anual (PV)"
        value={annualPV}
        format="currency"
        tone="default"
        sub={`${withdrawalRate}% de retiro`}
      />
      <Card
        label="Retiro mensual (PV)"
        value={monthlyPV}
        format="currency"
        tone="default"
        sub="poder de compra hoy"
      />
      <Card
        label="Ganancia acumulada"
        value={final.cumulativeGain}
        format="compact"
        tone="emerald"
        sub={`${formatPercent(gainPct)} sobre lo aportado`}
      />
    </div>
  );
}

type CardProps = {
  label: string;
  value: number;
  format: 'currency' | 'compact';
  sub?: string;
  tone: 'gold' | 'sky' | 'default' | 'emerald';
};

function Card({ label, value, format, sub, tone }: CardProps) {
  const animated = useAnimatedNumber(value, 500);
  const valueText = format === 'compact' ? formatCompact(animated) : formatCurrency(animated);
  const toneClass =
    tone === 'gold' ? 'text-gold-soft' : tone === 'sky' ? 'text-sky' : tone === 'emerald' ? 'text-emerald-300' : 'text-slate-100';
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className={`num text-xl md:text-2xl font-semibold ${toneClass} truncate`}>{valueText}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
