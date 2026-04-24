import { ContentReport } from "../types";

export const seedContentReports: ContentReport[] = [
  {
    id: "report-1",
    targetType: "review",
    targetId: "seed-review-lift-lab",
    reason: "misleading",
    notes: "User says the review claims the gym is empty during peak hours, but multiple reports disagree.",
    reportedBy: "Maya",
    createdAt: "24 min ago",
    status: "open"
  },
  {
    id: "report-2",
    targetType: "gym_submission",
    targetId: "submission-2",
    reason: "duplicate",
    notes: "Looks like a duplicate of Lift Lab Social Club with a slightly different address.",
    reportedBy: "Jordan",
    createdAt: "1 hr ago",
    status: "open"
  }
];
