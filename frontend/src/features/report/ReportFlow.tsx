import { useState } from "react";
import { ProgressIndicator } from "../../components/ProgressIndicator";
import { Button } from "../../components/Button";
import { createIncident, ApiError, type IncidentCategory } from "../../api/incidents";
import { queueIncident } from "./offlineQueue";
import { StepSafety } from "./steps/StepSafety";
import { StepCategory } from "./steps/StepCategory";
import { StepLocation, type LocationValue } from "./steps/StepLocation";
import { StepNotes } from "./steps/StepNotes";
import { StepReview } from "./steps/StepReview";
import { StepSubmitted } from "./steps/StepSubmitted";
import "./ReportFlow.css";

const TOTAL_STEPS = 5;

interface Draft {
  needsImmediateHelp: boolean | null;
  category: IncidentCategory | null;
  location: LocationValue;
  notes: string;
}

const emptyDraft: Draft = {
  needsImmediateHelp: null,
  category: null,
  location: { latitude: null, longitude: null, locationDescription: "", accuracyLow: false },
  notes: "",
};

type SubmitOutcome = { kind: "sent"; incidentId: string } | { kind: "queued" };

export function ReportFlow({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  const goTo = (target: number) => setStep(target);
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const hasUsableLocation =
    (draft.location.latitude !== null && draft.location.longitude !== null) ||
    draft.location.locationDescription.trim().length > 0;

  async function handleSubmit() {
    if (!draft.category) return; // guarded by disabled state already
    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      needs_immediate_help: draft.needsImmediateHelp ?? false,
      category: draft.category,
      latitude: draft.location.latitude,
      longitude: draft.location.longitude,
      location_description: draft.location.locationDescription.trim() || null,
      location_accuracy_low: draft.location.accuracyLow,
      photo_url: null, // photo upload not built yet — no storage adapter (README "Storage")
      notes: draft.notes.trim() || null,
    };

    if (!navigator.onLine) {
      queueIncident(payload);
      setOutcome({ kind: "queued" });
      setSubmitting(false);
      return;
    }

    try {
      const created = await createIncident(payload);
      setOutcome({ kind: "sent", incidentId: created.id });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // Validation failure — surface it rather than silently queueing
        // a report the backend will never accept.
        setSubmitError("Please check the report details and try again.");
      } else {
        // Network/server failure — never lose the report; queue it.
        queueIncident(payload);
        setOutcome({ kind: "queued" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (outcome) {
    return (
      <StepSubmitted
        outcome={outcome}
        showSafetyGuidance={draft.needsImmediateHelp === true || draft.category === "aggressive_behavior"}
        onDone={onExit}
      />
    );
  }

  return (
    <div className="report-flow">
      <ProgressIndicator current={step} total={TOTAL_STEPS} />

      {step === 1 && (
        <StepSafety
          onAnswer={(needsHelp) => {
            setDraft((d) => ({ ...d, needsImmediateHelp: needsHelp }));
            next();
          }}
        />
      )}

      {step === 2 && (
        <StepCategory
          value={draft.category}
          onSelect={(category) => {
            setDraft((d) => ({ ...d, category }));
            next();
          }}
        />
      )}

      {step === 3 && (
        <>
          <StepLocation
            value={draft.location}
            onChange={(location) => setDraft((d) => ({ ...d, location }))}
          />
          <StepNav onBack={() => goTo(2)} onNext={next} nextDisabled={!hasUsableLocation} />
        </>
      )}

      {step === 4 && (
        <>
          <StepNotes value={draft.notes} onChange={(notes) => setDraft((d) => ({ ...d, notes }))} />
          <StepNav onBack={() => goTo(3)} onNext={next} />
        </>
      )}

      {step === 5 && draft.category && (
        <>
          <StepReview
            data={{
              needsImmediateHelp: draft.needsImmediateHelp ?? false,
              category: draft.category,
              latitude: draft.location.latitude,
              longitude: draft.location.longitude,
              locationDescription: draft.location.locationDescription,
              notes: draft.notes,
            }}
            submitting={submitting}
            onEdit={goTo}
            onSubmit={handleSubmit}
          />
          {submitError && <p className="step__error" role="alert">{submitError}</p>}
        </>
      )}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="step__nav">
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
      <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
        Next
      </Button>
    </div>
  );
}
