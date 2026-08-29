import { create } from "zustand";

// Ejemplo de store de UI global (singleton de modulo: OK para estado de cliente puro).
// Para estado inicializado por request en App Router, usar store-per-request + Provider.
interface CounterState {
  count: number;
  inc: () => void;
  dec: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}));
