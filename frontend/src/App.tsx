import { useEffect, useState } from "react";
import { ReportFlow } from "./features/report/ReportFlow";
import { watchForReconnect } from "./features/report/offlineQueue";

/**
 * There is no Home screen / bottom-tab shell yet (ux-spec.md sec2) —
 * this increment only builds the Report flow itself. App renders it
 * directly; wrap this in the tab shell once Home/Alerts/History/Profile
 * screens exist.
 */
export default function App() {
  // `key` forces a fresh ReportFlow (and its draft state) after
  // completion, since there's no Home screen to navigate back to yet.
  const [flowKey, setFlowKey] = useState(0);

  useEffect(() => {
    // Auto-send anything queued while offline as soon as we reconnect,
    // not just on the next manual submit (ux-spec sec3.2 offline state).
    return watchForReconnect(() => {
      // Intentionally silent — the queued report's own confirmation
      // screen already told the user it would send later.
    });
  }, []);

  return (
    <ReportFlow key={flowKey} onExit={() => setFlowKey((k) => k + 1)} />
  );
}
