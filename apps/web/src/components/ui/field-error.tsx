export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="fieldError" role="alert">
      {message}
    </p>
  );
}
