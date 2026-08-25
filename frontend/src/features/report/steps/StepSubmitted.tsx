import { Button } from "../../../components/Button";

interface StepSubmittedProps {
  outcome: { kind: "sent"; incidentId: string } | { kind: "queued" };
  showSafetyGuidance: boolean;
  onDone: () => void;
}

export function StepSubmitted({ outcome, showSafetyGuidance, onDone }: StepSubmittedProps) {
  return (
    <div className="step">
      {outcome.kind === "sent" ? (
        <>
          <h1 className="step__question">Report sent</h1>
          <p className="step__hint">Reference ID: {outcome.incidentId}</p>
        </>
      ) : (
        <>
          <h1 className="step__question">Report saved</h1>
          <p className="offline-banner">
            Saved — will send when you're back online. Your report is safe on this device.
          </p>
        </>
      )}

      {showSafetyGuidance && (
        <div className="safety-guidance">
          <p className="safety-guidance__title">While you wait for help:</p>
          <ul>
            <li>Move to a safe distance — do not approach the animal.</li>
            <li>Keep others away from the area if you safely can.</li>
            <li>Stay somewhere you can be reached.</li>
          </ul>
        </div>
      )}

      <Button variant="primary" size="large" fullWidth onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
