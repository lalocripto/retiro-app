import type { Asset } from '../types';
import { ASSET_PALETTE } from '../constants';
import { rebalanceAllocations } from '../utils/calculations';
import { HelpTooltip } from './HelpTooltip';

type Props = {
  assets: Asset[];
  onChange: (assets: Asset[]) => void;
};

export function AssetAllocationEditor({ assets, onChange }: Props) {
  const total = assets.reduce((s, a) => s + a.allocation, 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const updateAsset = (id: string, patch: Partial<Asset>) => {
    onChange(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAsset = (id: string) => {
    if (assets.length <= 1) return;
    onChange(assets.filter((a) => a.id !== id));
  };

  const addAsset = () => {
    const id = `asset-${Date.now().toString(36)}`;
    const color = ASSET_PALETTE[assets.length % ASSET_PALETTE.length];
    onChange([
      ...assets,
      { id, name: `Activo ${assets.length + 1}`, allocation: 0, expectedReturn: 8, color },
    ]);
  };

  const rebalance = () => {
    const fixed = rebalanceAllocations(assets.map((a) => a.allocation));
    onChange(assets.map((a, i) => ({ ...a, allocation: fixed[i] })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="heading-serif text-sm flex items-center gap-1.5">
          Asignación de portafolio
          <HelpTooltip text="Distribución por clase de activo. Las aportaciones mensuales se reparten según estos porcentajes." />
        </h3>
        <span
          className={`num text-xs px-2 py-1 rounded-md ${
            isValid ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose/15 text-rose'
          }`}
        >
          Σ {total.toFixed(1)}%
        </span>
      </div>

      {!isValid && (
        <div className="text-[11px] text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2">
          La asignación debe sumar exactamente 100%. Ajusta manualmente o usa "Rebalancear".
        </div>
      )}

      <div className="space-y-2">
        {assets.map((a) => (
          <div key={a.id} className="bg-bg-muted/60 border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: a.color ?? '#888' }}
              />
              <input
                type="text"
                value={a.name}
                onChange={(e) => updateAsset(a.id, { name: e.target.value })}
                className="flex-1 bg-transparent border-0 text-sm text-slate-100 focus:outline-none focus:text-white px-0"
              />
              <button
                type="button"
                onClick={() => removeAsset(a.id)}
                disabled={assets.length <= 1}
                aria-label="Eliminar activo"
                className="text-slate-500 hover:text-rose disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Asignación</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={a.allocation}
                    onChange={(e) => updateAsset(a.id, { allocation: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="input-base pr-7 py-1.5 text-xs"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">%</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Rendimiento</label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.5}
                    value={a.expectedReturn}
                    onChange={(e) => updateAsset(a.id, { expectedReturn: parseFloat(e.target.value) || 0 })}
                    className="input-base pr-7 py-1.5 text-xs"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">%/yr</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={addAsset} className="btn-secondary flex-1 text-xs">
          + Agregar activo
        </button>
        <button
          type="button"
          onClick={rebalance}
          disabled={isValid}
          className="btn-primary flex-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Rebalancear a 100%
        </button>
      </div>
    </div>
  );
}
