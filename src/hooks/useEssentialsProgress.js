import { makeProgressHook } from './useProgress';
import { STORAGE_KEYS } from '../utils/storage';
import { essentials } from '../data/essentials';

/** Same API as useProgress, stored separately (ebs:essentials-progress). */
export const useEssentialsProgress = makeProgressHook(STORAGE_KEYS.essentialsProgress, () => essentials);
