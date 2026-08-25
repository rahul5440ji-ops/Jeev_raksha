import type { IncidentCategory } from "../../../api/incidents";
import { CATEGORY_OPTIONS } from "../utils/categoryOptions";

interface StepCategoryProps {
  value: IncidentCategory | null;
  onSelect: (category: IncidentCategory) => void;
}

export function StepCategory({ value, onSelect }: StepCategoryProps) {
  return (
    <div className="step">
      <h1 className="step__question">What's happening?</h1>

      <div className="category-grid" role="radiogroup" aria-label="What's happening">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`category-card${value === opt.value ? " category-card--selected" : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <span className="category-card__icon" aria-hidden="true">{opt.icon}</span>
            <span className="category-card__label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
