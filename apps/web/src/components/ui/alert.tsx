import type { ReactNode } from 'react';

export function Alert({ variant = 'info', children }: { variant?: 'info' | 'error'; children: ReactNode }) {
  const variantClass = variant === 'error' ? 'alertError' : 'alertInfo';
  return (
    <div className={`alert ${variantClass}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
