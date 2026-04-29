import type { WithdrawalScenario } from '../types';
import { formatCompact, formatCurrency } from '../utils/format';

type Props = {
  scenarios: WithdrawalScenario[];
  selectedRate: number;
};

const TONE: Record<WithdrawalScenario['label'], { ring: string; chip: string; label: string }> = {
  seguro: { ring: 'border-emerald-400/30', chip: 'bg-emerald-400/15 text-emerald-300', label: 'Seguro' },
  estándar: { ring: 'border-gold/40', chip: 'bg-gold/15 text-gold-soft', label: 'Estándar' },
  agresivo: { ring: 'border-rose/30', chip: 'bg-rose/15 text-rose', label: 'Agresivo' },
};

export function WithdrawalComparison({ scenarios, selectedRate }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="heading-serif text-base">Tasas de retiro comparadas</h2>
        <span className="text-[11px] text-slate-500">basado en el valor final proyectado</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((s) => {
          const tone = TONE[s.label];
          const isSelected = Math.abs(s.rate - selectedRate) < 0.05;
          return (
            <div
              key={s.rate}
              className={`relative bg-bg-muted/50 border rounded-xl p-4 transition-all ${tone.ring} ${
                isSelected ? 'ring-2 ring-gold/40 shadow-glow' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="num text-2xl font-semibold text-slate-100">{s.rate}%</div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${tone.chip}`}>
                  {tone.label}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <Row label="Anual nominal" value={formatCompact(s.annualNominal)} />
                <Row label="Anual (PV hoy)" value={formatCompact(s.annualPV)} />
                <Row label="Mensual (PV hoy)" value={formatCurrency(s.monthlyPV)} accent />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-3">
        La regla del 4% (Trinity Study) propone que retirar 4% inicial ajustado por inflación dura ~30 años con alta probabilidad. 3.5% es más conservador; 5% asume rendimientos sostenidos altos.
      </p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`num ${accent ? 'text-gold-soft font-semibold' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}
