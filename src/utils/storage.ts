import { STORAGE_KEY, SCHEMA_VERSION, DEFAULT_INPUTS } from '../constants';
import type { PlannerInputs, StoredState } from '../types';

export function loadState(): PlannerInputs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== SCHEMA_VERSION) {
      return migrate(parsed);
    }
    return mergeWithDefaults(parsed.inputs);
  } catch (err) {
    console.warn('No se pudo cargar el estado guardado:', err);
    return null;
  }
}

export function saveState(inputs: PlannerInputs): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredState = { version: SCHEMA_VERSION, inputs };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('No se pudo guardar el estado:', err);
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

function migrate(_parsed: StoredState): PlannerInputs {
  return DEFAULT_INPUTS;
}

function mergeWithDefaults(inputs: Partial<PlannerInputs>): PlannerInputs {
  return {
    ...DEFAULT_INPUTS,
    ...inputs,
    assets: inputs.assets && inputs.assets.length > 0 ? inputs.assets : DEFAULT_INPUTS.assets,
  };
}
