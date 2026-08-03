export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <span className="loadingIndicator" role="status">
      {label}
    </span>
  );
}
