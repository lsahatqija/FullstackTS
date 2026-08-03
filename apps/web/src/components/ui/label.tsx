import type { LabelHTMLAttributes } from 'react';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={['label', className].filter(Boolean).join(' ')} {...props} />;
}
