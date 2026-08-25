interface StepNotesProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepNotes({ value, onChange }: StepNotesProps) {
  return (
    <div className="step">
      <h1 className="step__question">Anything else?</h1>
      <p className="step__hint">Optional — add any details that might help.</p>

      <textarea
        className="field-textarea"
        placeholder="Optional details…"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Additional details, optional"
      />
    </div>
  );
}
