import { Gym, GymSubmission, GymSubmissionForm } from "../types";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findPotentialDuplicate(gyms: Gym[], form: GymSubmissionForm) {
  const targetName = normalize(form.name);
  const targetArea = normalize(`${form.city}${form.neighborhood}`);

  return gyms.find((gym) => {
    const sameName = normalize(gym.name) === targetName;
    const sameArea = normalize(`${gym.city}${gym.neighborhood}`) === targetArea;
    return sameName || (sameArea && normalize(gym.name).includes(targetName.slice(0, 6)));
  });
}

export function submissionToGym(submission: GymSubmission, index: number): Gym {
  return {
    id: `gym-${normalize(submission.name)}-${index}`,
    name: submission.name,
    city: submission.city,
    neighborhood: submission.neighborhood,
    address: submission.address,
    distanceMiles: 1.8 + index * 0.1,
    isOpen: true,
    rating: 4.4,
    liveBusyness: 38,
    crowdReports: 3,
    coordinates: {
      latitude: 37.7749 + index * 0.002,
      longitude: -122.4194 + index * 0.002
    },
    bestWindow: "11:00 AM to 2:00 PM",
    highlights: ["Recently added", "Waiting for member reviews", "Crowd data just starting"],
    latestCheckIns: [
      { label: "Fresh listing added", tone: "calm" },
      { label: "Need more crowd reports", tone: "mid" },
      { label: "Members can review machines", tone: "calm" }
    ],
    liveTrend: [
      { label: "Now", value: 38 },
      { label: "+1h", value: 44 },
      { label: "+2h", value: 51 },
      { label: "+3h", value: 46 },
      { label: "+4h", value: 34 }
    ],
    weekTrend: [
      { label: "Mon", value: 53 },
      { label: "Tue", value: 48 },
      { label: "Wed", value: 52 },
      { label: "Thu", value: 50 },
      { label: "Fri", value: 41 },
      { label: "Sat", value: 37 },
      { label: "Sun", value: 29 }
    ],
    monthTrend: [
      { label: "W1", value: 36 },
      { label: "W2", value: 42 },
      { label: "W3", value: 47 },
      { label: "W4", value: 40 }
    ],
    reviews: [
      {
        author: "GymBusy",
        score: 4.4,
        body: `Imported from community submission. Original notes: ${submission.notes || "No additional notes yet."}`
      }
    ]
  };
}
