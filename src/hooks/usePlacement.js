import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/*
  Placement test result (ebs:placement):
  { level: 'A2' | null, startLevel: 'B1', scores: { A1: 6, A2: 5, B1: 2 }, takenAt: '…' }
  null = test not taken yet.
*/
export function usePlacement() {
  const [placement, setPlacement] = useLocalStorage(STORAGE_KEYS.placement, null);

  const savePlacement = useCallback(
    (result) => setPlacement({ ...result, takenAt: new Date().toISOString() }),
    [setPlacement],
  );
  const clearPlacement = useCallback(() => setPlacement(null), [setPlacement]);

  return { placement, savePlacement, clearPlacement };
}
