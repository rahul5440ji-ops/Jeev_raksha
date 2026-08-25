interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="progress" role="status" aria-live="polite">
      <span className="progress__text">
        Step {current} of {total}
      </span>
      <div className="progress__track" aria-hidden="true">
        <div className="progress__fill" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}
