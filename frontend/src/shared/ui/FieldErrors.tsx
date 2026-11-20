export function FieldErrors({ errors }: { errors: unknown[] }) {
  return <>{errors.filter(Boolean).map((error, i) => <p role="alert" className="field-error" key={i}>{typeof error === 'string' ? error : error instanceof Error ? error.message : String(error)}</p>)}</>
}
