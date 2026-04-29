import type { PlannerInputs } from '../types';
import { NumberInput, SliderInput } from './NumberInput';
import { AssetAllocationEditor } from './AssetAllocationEditor';
import { ImportExportButtons } from './ImportExportButtons';

type Props = {
  inputs: PlannerInputs;
  onChange: (next: PlannerInputs) => void;
};

export function ControlPanel({ inputs, onChange }: Props) {
  const update = <K extends keyof PlannerInputs>(key: K, value: PlannerInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  return (
    <aside className="space-y-5">
      <header className="space-y-1">
        <h1 className="heading-serif text-2xl">
          <span className="text-gold-soft">Retiro</span>
          <span className="text-slate-500 font-sans text-sm font-normal ml-2">Planificador</span>
        </h1>
        <p className="text-xs text-slate-400">Modela tu portafolio. Todo se guarda en tu navegador.</p>
      </header>

      <section className="card p-4 space-y-3">
        <h2 className="heading-serif text-sm">Punto de partida</h2>
        <NumberInput
          label="Capital inicial invertido"
          value={inputs.initialCapital}
          onChange={(v) => update('initialCapital', v)}
          prefix="$"
          step={1000}
          help="Dinero que ya tienes invertido hoy. Se distribuye entre los activos según su asignación."
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Edad actual"
            value={inputs.currentAge}
            onChange={(v) => update('currentAge', v)}
            min={0}
            max={100}
            help="Tu edad de hoy. Se usa para mostrar tu edad proyectada en cada año."
          />
          <NumberInput
            label="Fondo de emergencia"
            value={inputs.emergencyFund}
            onChange={(v) => update('emergencyFund', v)}
            prefix="$"
            step={1000}
            help="Reserva líquida separada. NO se incluye en las proyecciones del portafolio."
          />
        </div>
      </section>

      <section className="card p-4">
        <AssetAllocationEditor
          assets={inputs.assets}
          onChange={(assets) => update('assets', assets)}
        />
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="heading-serif text-sm">Aportaciones</h2>
        <NumberInput
          label="Aportación mensual"
          value={inputs.monthlyContribution}
          onChange={(v) => update('monthlyContribution', v)}
          prefix="$"
          step={100}
          help="Cuánto agregas al portafolio cada mes."
        />
        <NumberInput
          label="Crecimiento anual de aportación"
          value={inputs.contributionGrowth}
          onChange={(v) => update('contributionGrowth', v)}
          suffix="%"
          step={0.5}
          allowNegative
          help="Aumento porcentual por año en tu aportación (simula aumentos de salario). Puede ser negativo."
        />
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="heading-serif text-sm">Parámetros económicos</h2>
        <NumberInput
          label="Inflación anual esperada"
          value={inputs.inflation}
          onChange={(v) => update('inflation', v)}
          suffix="%"
          step={0.5}
          help="Se usa para descontar el valor presente neto y mostrar tu poder de compra real."
        />
        <SliderInput
          label="Horizonte"
          value={inputs.horizonYears}
          onChange={(v) => update('horizonYears', Math.round(v))}
          min={1}
          max={40}
          suffix=" años"
          help="Cuántos años hacia adelante proyectar."
        />
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="heading-serif text-sm">Estrategia de retiro</h2>
        <SliderInput
          label="Tasa de retiro"
          value={inputs.withdrawalRate}
          onChange={(v) => update('withdrawalRate', Math.round(v * 10) / 10)}
          min={2}
          max={7}
          step={0.1}
          suffix="%"
          help="Porcentaje del portafolio que retirarías cada año en el retiro. La regla del 4% es un estándar histórico."
        />
      </section>

      <section className="card p-4">
        <h2 className="heading-serif text-sm mb-3">Configuración</h2>
        <ImportExportButtons inputs={inputs} onChange={onChange} />
      </section>
    </aside>
  );
}
