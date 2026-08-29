"use client";

import { useCounterStore } from "@/stores/counter-store";
import { Button } from "@/components/ui/button";

export function Counter() {
  // Selectores atomicos (no devolver objetos nuevos en el selector).
  const count = useCounterStore((s) => s.count);
  const inc = useCounterStore((s) => s.inc);
  const dec = useCounterStore((s) => s.dec);

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={dec} aria-label="Restar">
        -
      </Button>
      <span className="min-w-8 text-center tabular-nums">{count}</span>
      <Button variant="outline" size="icon" onClick={inc} aria-label="Sumar">
        +
      </Button>
    </div>
  );
}
