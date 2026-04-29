import { useEffect, useRef, useState } from 'react';
import type { PlannerInputs } from '../types';
import { loadState, saveState } from '../utils/storage';
import { DEFAULT_INPUTS } from '../constants';

export function usePersistedInputs(): [PlannerInputs, React.Dispatch<React.SetStateAction<PlannerInputs>>] {
  const [state, setState] = useState<PlannerInputs>(() => loadState() ?? DEFAULT_INPUTS);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  return [state, setState];
}
