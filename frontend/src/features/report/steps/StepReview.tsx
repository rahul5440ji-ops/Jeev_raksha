import type { IncidentCategory } from "../../../api/incidents";
import { Button } from "../../../components/Button";
import { getCategoryLabel } from "../utils/categoryOptions";

export interface ReviewData {
  needsImmediateHelp: boolean;
  category: IncidentCategory;
  latitude: number | null;
  longitude: number | null;
  locationDescription: string;
  notes: string;
}

interface StepReviewProps {
  data: ReviewData;
  submitting: boolean;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

export function StepReview({ data, submitting, onEdit, onSubmit }: StepReviewProps) {
  const locationSummary =
    data.latitude !== null
      ? "Using your current location"
      : data.locationDescription || "Not provided";

  return (
    <div className="step">
      <h1 className="step__question">Review &amp; submit</h1>

      <dl className="review-card">
        <ReviewRow label="Safety" value={data.needsImmediateHelp ? "I need help now" : "I'm safe"} onEdit={() => onEdit(1)} />
        <ReviewRow label="What's happening" value={getCategoryLabel(data.category)} onEdit={() => onEdit(2)} />
        <ReviewRow label="Location" value={locationSummary} onEdit={() => onEdit(3)} />
        <ReviewRow label="Notes" value={data.notes || "None"} onEdit={() => onEdit(4)} />
      </dl>

      <Button variant="primary" size="large" fullWidth onClick={onSubmit} disabled={submitting}>
        {submitting ? "Sending your report…" : "Submit Report"}
      </Button>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="review-row">
      <div>
        <dt className="review-row__label">{label}</dt>
        <dd className="review-row__value">{value}</dd>
      </div>
      <Button variant="ghost" onClick={onEdit} aria-label={`Edit ${label}`}>
        Edit
      </Button>
    </div>
  );
}
