import { useMemo } from 'react';
import { usePersistedInputs } from './hooks/usePersistedState';
import { projectPortfolio, withdrawalScenarios, isAllocationValid } from './utils/calculations';
import { ControlPanel } from './components/ControlPanel';
import { ResultsCards } from './components/ResultsCards';
import { ProjectionChart } from './components/ProjectionChart';
import { WithdrawalComparison } from './components/WithdrawalComparison';
import { YearByYearTable } from './components/YearByYearTable';

export default function App() {
  const [inputs, setInputs] = usePersistedInputs();

  const projections = useMemo(() => {
    if (!isAllocationValid(inputs)) return null;
    return projectPortfolio(inputs);
  }, [inputs]);

  const scenarios = useMemo(() => {
    if (!projections) return null;
    const finalNominal = projections[projections.length - 1].totalNominal;
    return withdrawalScenarios(finalNominal, inputs.inflation, inputs.horizonYears);
  }, [projections, inputs.inflation, inputs.horizonYears]);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2 -mr-2">
          <ControlPanel inputs={inputs} onChange={setInputs} />
        </div>

        <main className="space-y-5 min-w-0">
          {!projections || !scenarios ? (
            <div className="card p-8 text-center">
              <div className="heading-serif text-lg text-rose mb-2">Asignación inválida</div>
              <p className="text-sm text-slate-400">
                Los porcentajes de tus activos deben sumar exactamente 100% antes de proyectar.
                Usa el botón <span className="text-gold-soft">"Rebalancear a 100%"</span> en el panel lateral.
              </p>
            </div>
          ) : (
            <>
              <ResultsCards
                projections={projections}
                withdrawalRate={inputs.withdrawalRate}
                inflation={inputs.inflation}
                initialCapital={inputs.initialCapital}
              />
              <ProjectionChart projections={projections} assets={inputs.assets} />
              <WithdrawalComparison scenarios={scenarios} selectedRate={inputs.withdrawalRate} />
              <YearByYearTable projections={projections} />
            </>
          )}

          <footer className="text-[10px] text-slate-600 pt-4 pb-2 text-center">
            Esta herramienta es informativa. Los rendimientos pasados no garantizan resultados futuros.
            Tus datos viven solo en tu navegador.
          </footer>
        </main>
      </div>
    </div>
  );
}
