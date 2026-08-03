import type { ReactNode } from 'react';

export function FormField({ children }: { children: ReactNode }) {
  return <div className="formField">{children}</div>;
}
