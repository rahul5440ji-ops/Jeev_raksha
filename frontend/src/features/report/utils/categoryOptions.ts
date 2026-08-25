import type { IncidentCategory } from "../../../api/incidents";

export interface CategoryOption {
  value: IncidentCategory;
  label: string;
  icon: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "animal_sighting", label: "Animal sighting", icon: "\u{1F43E}" },
  { value: "animal_in_distress", label: "Animal in distress or injured", icon: "\u{1FA79}" },
  { value: "animal_blocking_path", label: "Animal blocking a path", icon: "\u{1F6A7}" },
  { value: "aggressive_behavior", label: "Aggressive behavior", icon: "\u26A0\uFE0F" },
  { value: "other", label: "Other", icon: "\u2022\u2022\u2022" },
];

export function getCategoryLabel(value: IncidentCategory): string {
  return CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
}
