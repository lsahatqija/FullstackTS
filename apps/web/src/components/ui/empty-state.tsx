import type { ReactNode } from 'react';

export function EmptyState({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="emptyState">
      <p>
        <strong>{title}</strong>
      </p>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
