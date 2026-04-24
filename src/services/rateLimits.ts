const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export const rateLimitWindows = {
  crowdReportMs: 10 * MINUTE_MS,
  reviewMs: 24 * HOUR_MS
} as const;

export type ActionLog = Record<string, number>;

export function actionKey(kind: "crowd" | "review", userId: string, gymId: string) {
  return `${kind}:${userId}:${gymId}`;
}

export function getRemainingMs(log: ActionLog, key: string, windowMs: number) {
  const lastActionAt = log[key];
  if (!lastActionAt) {
    return 0;
  }

  return Math.max(0, windowMs - (Date.now() - lastActionAt));
}

export function formatRemainingTime(ms: number) {
  const minutes = Math.ceil(ms / MINUTE_MS);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hr`;
}
