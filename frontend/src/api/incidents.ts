/**
 * API client for the backend incidents endpoints.
 *
 * Mirrors backend/app/schemas/incident.py exactly. Keep these two in
 * sync by hand for now — codegen (e.g. openapi-typescript) is a
 * reasonable next step once the API surface grows past this.
 */

export type IncidentCategory =
  | "animal_sighting"
  | "animal_in_distress"
  | "animal_blocking_path"
  | "aggressive_behavior"
  | "other";

export type IncidentStatus = "submitted" | "queued_offline" | "verified" | "closed";

export interface IncidentCreatePayload {
  needs_immediate_help: boolean;
  category: IncidentCategory;
  latitude?: number | null;
  longitude?: number | null;
  location_description?: string | null;
  location_accuracy_low: boolean;
  photo_url?: string | null;
  notes?: string | null;
}

export interface IncidentRead extends IncidentCreatePayload {
  id: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
}

// Vite env var — set VITE_API_BASE_URL in frontend/.env for non-default setups.
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export async function createIncident(payload: IncidentCreatePayload): Promise<IncidentRead> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail: unknown = null;
    try {
      detail = await response.json();
    } catch {
      // response body wasn't JSON — leave detail null
    }
    throw new ApiError(response.status, detail);
  }

  return response.json();
}
