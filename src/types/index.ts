export type BusynessLevel = 25 | 50 | 75 | 95;

export type CheckInTone = "calm" | "mid" | "warn";

export type TrendPoint = {
  label: string;
  value: number;
};

export type Review = {
  id?: string;
  author: string;
  score: number;
  body: string;
};

export type SubmissionStatus = "pending" | "approved" | "rejected" | "merged";
export type AuthProvider = "apple" | "google" | "email";
export type BackendMode = "seeded" | "supabase";

export type CrowdReport = {
  id: string;
  gymId: string;
  level: BusynessLevel;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  provider: AuthProvider;
  email?: string;
  homeGymId?: string;
};

export type GymCoordinates = {
  latitude: number;
  longitude: number;
};

export type Gym = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  address?: string;
  distanceMiles: number;
  isOpen: boolean;
  rating: number;
  liveBusyness: number;
  crowdReports: number;
  coordinates: GymCoordinates;
  bestWindow: string;
  highlights: string[];
  latestCheckIns: Array<{
    label: string;
    tone: CheckInTone;
  }>;
  liveTrend: TrendPoint[];
  weekTrend: TrendPoint[];
  monthTrend: TrendPoint[];
  reviews: Review[];
};

export type GymSubmission = {
  id: string;
  name: string;
  address: string;
  city: string;
  neighborhood: string;
  chainName: string;
  notes: string;
  submittedBy: string;
  createdAt: string;
  status: SubmissionStatus;
  duplicateGymId?: string;
  reviewedAt?: string;
};

export type GymSubmissionForm = {
  name: string;
  address: string;
  city: string;
  neighborhood: string;
  chainName: string;
  notes: string;
};

export type ReviewForm = {
  score: number;
  body: string;
};

export type ContentReportReason =
  | "spam"
  | "harassment"
  | "misleading"
  | "duplicate"
  | "inappropriate";

export type ContentReportForm = {
  targetType: "review" | "crowd_report" | "gym_submission";
  targetId: string;
  reason: ContentReportReason;
  notes: string;
};

export type ContentReportStatus = "open" | "resolved" | "dismissed";

export type ContentReport = ContentReportForm & {
  id: string;
  reportedBy: string;
  createdAt: string;
  status: ContentReportStatus;
};
