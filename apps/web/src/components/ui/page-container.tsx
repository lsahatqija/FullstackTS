import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="pageContainer">{children}</div>;
}
