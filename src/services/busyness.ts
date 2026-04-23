import { BusynessLevel, CheckInTone, CrowdReport, Gym } from "../types";

function reportWeight(createdAt: string) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageMinutes = ageMs / 60000;
  return Math.max(0.15, 1 - ageMinutes / 90);
}

export function calculateWeightedBusyness(reports: CrowdReport[], currentValue: number) {
  if (reports.length === 0) {
    return currentValue;
  }

  const weightedSum = reports.reduce((sum, report) => sum + report.level * reportWeight(report.createdAt), 0);
  const totalWeight = reports.reduce((sum, report) => sum + reportWeight(report.createdAt), 0);
  return Math.round(weightedSum / totalWeight);
}

export function applyCrowdReport(gym: Gym, level: BusynessLevel, gymReports: CrowdReport[]): Gym {
  const nextBusyness = calculateWeightedBusyness(gymReports, gym.liveBusyness);
  const tone: CheckInTone = level > 75 ? "warn" : level > 45 ? "mid" : "calm";

  return {
    ...gym,
    liveBusyness: nextBusyness,
    crowdReports: gymReports.length,
    latestCheckIns: [
      {
        label: `${level}% busy`,
        tone
      },
      ...gym.latestCheckIns
    ].slice(0, 3)
  };
}

export function getCrowdState(value: number) {
  if (value >= 80) {
    return "Packed";
  }
  if (value >= 55) {
    return "Steady";
  }
  return "Smooth";
}

export function getCrowdConfidence(reportCount: number) {
  if (reportCount >= 20) {
    return "High";
  }
  if (reportCount >= 8) {
    return "Medium";
  }
  return "Building";
}
