import { Button } from "../../../components/Button";

interface StepSafetyProps {
  onAnswer: (needsHelp: boolean) => void;
}

// Regional emergency number is configured via env, never hardcoded here
// (README "Secrets & Configuration" — no invented values in code).
const EMERGENCY_NUMBER = import.meta.env.VITE_EMERGENCY_NUMBER || "";

export function StepSafety({ onAnswer }: StepSafetyProps) {
  return (
    <div className="step">
      <h1 className="step__question">Are you safe right now?</h1>
      <p className="step__hint">This helps us get you the right kind of help first.</p>

      <div className="step__actions step__actions--stacked">
        <Button variant="danger" size="large" fullWidth onClick={() => onAnswer(true)}>
          I need help now
        </Button>
        <Button variant="secondary" size="large" fullWidth onClick={() => onAnswer(false)}>
          I'm safe
        </Button>
      </div>

      {EMERGENCY_NUMBER && (
        <p className="step__emergency-hint">
          In immediate danger?{" "}
          <a className="step__emergency-link" href={`tel:${EMERGENCY_NUMBER}`}>
            Call local emergency number
          </a>
        </p>
      )}
    </div>
  );
}
