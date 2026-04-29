import { useRef } from 'react';
import type { PlannerInputs } from '../types';
import { DEFAULT_INPUTS, SCHEMA_VERSION } from '../constants';

type Props = {
  inputs: PlannerInputs;
  onChange: (inputs: PlannerInputs) => void;
};

export function ImportExportButtons({ inputs, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = { version: SCHEMA_VERSION, inputs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retiro-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const candidate: PlannerInputs = parsed.inputs ?? parsed;
      if (!candidate || typeof candidate !== 'object' || !Array.isArray(candidate.assets)) {
        throw new Error('Estructura inválida');
      }
      onChange({ ...DEFAULT_INPUTS, ...candidate });
    } catch (err) {
      alert(`No se pudo importar: ${(err as Error).message}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer todos los valores por defecto? Esta acción no se puede deshacer.')) {
      onChange(DEFAULT_INPUTS);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={handleExport} className="btn-secondary text-xs">
          ↓ Exportar
        </button>
        <button type="button" onClick={handleImportClick} className="btn-secondary text-xs">
          ↑ Importar
        </button>
      </div>
      <button type="button" onClick={handleReset} className="btn-danger w-full text-xs">
        Restablecer valores
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
    </div>
  );
}
