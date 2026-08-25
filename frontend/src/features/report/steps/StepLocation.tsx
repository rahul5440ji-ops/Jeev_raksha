import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";

export interface LocationValue {
  latitude: number | null;
  longitude: number | null;
  locationDescription: string;
  accuracyLow: boolean;
}

interface StepLocationProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

type GpsState = "requesting" | "granted" | "denied" | "manual";

// Rough accuracy threshold (meters) above which we surface the
// "location may be approximate" note per ux-spec sec3.2 rather than
// blocking submission.
const LOW_ACCURACY_THRESHOLD_M = 100;

export function StepLocation({ value, onChange }: StepLocationProps) {
  const [gpsState, setGpsState] = useState<GpsState>("requesting");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsState("manual");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracyLow = position.coords.accuracy > LOW_ACCURACY_THRESHOLD_M;
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationDescription: value.locationDescription,
          accuracyLow,
        });
        setGpsState("granted");
      },
      () => {
        // Denied, unavailable, or timed out — never block the flow.
        // Spec: "allow submission with a text location description
        // instead of blocking the whole report."
        setGpsState("manual");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchToManual = () => {
    onChange({ ...value, latitude: null, longitude: null });
    setGpsState("manual");
  };

  return (
    <div className="step">
      <h1 className="step__question">Where is this happening?</h1>

      {gpsState === "requesting" && (
        <p className="step__hint">Getting your location…</p>
      )}

      {gpsState === "granted" && value.latitude !== null && (
        <div>
          <p className="location-confirm">Using your current location \u2713</p>
          {value.accuracyLow && (
            <p className="step__notice">Location may be approximate.</p>
          )}
          <Button variant="ghost" onClick={switchToManual}>
            That's not right
          </Button>
        </div>
      )}

      {gpsState === "manual" && (
        <div>
          <label className="field-label" htmlFor="location-description">
            Describe the location
          </label>
          <textarea
            id="location-description"
            className="field-textarea"
            placeholder="e.g. Near the east paddy field, past the old well, Chinnakanal"
            rows={3}
            value={value.locationDescription}
            onChange={(e) =>
              onChange({ ...value, locationDescription: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
