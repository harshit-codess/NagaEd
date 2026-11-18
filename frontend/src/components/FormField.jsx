import { useId } from 'react';

export default function FormField({ label, error, hint, ...inputProps }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} {...inputProps} />
      {hint && !error && <small className="muted">{hint}</small>}
      {error && (
        <small id={`${id}-err`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
