import { LoadingIndicator } from '../components/ui/index';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <LoadingIndicator />
    </div>
  );
}
