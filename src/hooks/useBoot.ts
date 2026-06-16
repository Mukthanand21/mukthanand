import { createContext, useContext } from 'react';

export type BootState = {
  bootComplete: boolean;
};

export const BootContext = createContext<BootState>({ bootComplete: false });

export function useBoot() {
  return useContext(BootContext);
}
