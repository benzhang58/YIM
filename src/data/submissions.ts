import { GymSubmission } from "../types";

export const seedSubmissions: GymSubmission[] = [
  {
    id: "submission-1",
    name: "Steel District Training",
    address: "455 Bryant St",
    city: "San Francisco",
    neighborhood: "SoMa",
    chainName: "",
    notes: "New strength gym near the ballpark. Members mentioned it opened recently.",
    submittedBy: "Alex",
    createdAt: "18 min ago",
    status: "pending"
  },
  {
    id: "submission-2",
    name: "Lift Lab Social Club",
    address: "201 Townsend St",
    city: "San Francisco",
    neighborhood: "SoMa",
    chainName: "",
    notes: "Looks like this already exists but the user entered a slightly different address format.",
    submittedBy: "Priya",
    createdAt: "42 min ago",
    status: "merged",
    duplicateGymId: "lift-lab",
    reviewedAt: "12 min ago"
  }
];
