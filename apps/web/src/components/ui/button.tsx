import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = variant === 'secondary' ? 'buttonSecondary' : '';
  return <button className={['button', variantClass, className].filter(Boolean).join(' ')} {...props} />;
}
