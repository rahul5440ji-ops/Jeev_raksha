/**
 * Offline queue for incident reports.
 *
 * ux-spec.md sec3.2 "Offline at submit time" state: the report is saved
 * locally and marked "will send when you're back online" — the user is
 * never blocked. This module implements that: queue in localStorage,
 * flush automatically when the browser regains connectivity.
 *
 * Deliberately simple (localStorage, not IndexedDB) for this increment.
 * If photo attachments are added later, this will need to move to
 * IndexedDB — localStorage can't hold binary blobs at any real size.
 */
import { createIncident, type IncidentCreatePayload } from "../../api/incidents";

const QUEUE_KEY = "jeevraksha_offline_incident_queue";

interface QueuedIncident {
  localId: string;
  payload: IncidentCreatePayload;
  queuedAt: string;
}

function readQueue(): QueuedIncident[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedIncident[]) : [];
  } catch {
    // Corrupt or inaccessible storage — treat as empty rather than crash the flow.
    return [];
  }
}

function writeQueue(queue: QueuedIncident[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full/unavailable — the in-memory submit already happened
    // or failed independently; nothing further to do here.
  }
}

export function queueIncident(payload: IncidentCreatePayload): string {
  const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const queue = readQueue();
  queue.push({ localId, payload, queuedAt: new Date().toISOString() });
  writeQueue(queue);
  return localId;
}

export function getQueueLength(): number {
  return readQueue().length;
}

/**
 * Attempt to send every queued report. Successfully sent reports are
 * removed; failures stay queued for the next attempt. Returns counts
 * so the UI can show a brief confirmation if it wants to.
 */
export async function flushQueue(): Promise<{ sent: number; remaining: number }> {
  const queue = readQueue();
  if (queue.length === 0) {
    return { sent: 0, remaining: 0 };
  }

  const stillQueued: QueuedIncident[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      await createIncident(item.payload);
      sent += 1;
    } catch {
      stillQueued.push(item);
    }
  }

  writeQueue(stillQueued);
  return { sent, remaining: stillQueued.length };
}

/** Wire up automatic flushing when the browser comes back online. */
export function watchForReconnect(onFlushed: (result: { sent: number; remaining: number }) => void): () => void {
  const handler = () => {
    flushQueue().then(onFlushed);
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
