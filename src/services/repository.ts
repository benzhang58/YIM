import { gyms as seedGyms } from "../data/gyms";
import { seedSubmissions } from "../data/submissions";
import { BusynessLevel, Gym, GymSubmission, GymSubmissionForm, Review, ReviewForm, UserProfile } from "../types";
import { isSupabaseConfigured, supabase } from "./supabase";

function sortGyms(gyms: Gym[]) {
  return [...gyms].sort((a, b) => a.distanceMiles - b.distanceMiles);
}

export async function loadGyms(): Promise<{ gyms: Gym[]; mode: "seeded" | "supabase" }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      gyms: sortGyms(seedGyms),
      mode: "seeded"
    };
  }

  const { data, error } = await supabase.from("gyms").select("*").eq("is_active", true);
  if (error || !data || data.length === 0) {
    return {
      gyms: sortGyms(seedGyms),
      mode: "seeded"
    };
  }

  const gyms: Gym[] = data.map((row: any, index: number) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address ?? undefined,
    distanceMiles: 0.8 + index * 0.5,
    isOpen: true,
    rating: 4.5,
    liveBusyness: 42,
    crowdReports: 0,
    coordinates: {
      latitude: Number(row.latitude ?? 37.7749),
      longitude: Number(row.longitude ?? -122.4194)
    },
    bestWindow: "11:00 AM to 2:00 PM",
    highlights: ["Live crowd data enabled", "Awaiting member reviews", "Production listing"],
    latestCheckIns: [
      { label: "Fresh production listing", tone: "calm" },
      { label: "Need crowd reports", tone: "mid" },
      { label: "Members can review equipment", tone: "calm" }
    ],
    liveTrend: [
      { label: "Now", value: 42 },
      { label: "+1h", value: 46 },
      { label: "+2h", value: 54 },
      { label: "+3h", value: 49 },
      { label: "+4h", value: 35 }
    ],
    weekTrend: [
      { label: "Mon", value: 63 },
      { label: "Tue", value: 54 },
      { label: "Wed", value: 58 },
      { label: "Thu", value: 61 },
      { label: "Fri", value: 45 },
      { label: "Sat", value: 37 },
      { label: "Sun", value: 33 }
    ],
    monthTrend: [
      { label: "W1", value: 40 },
      { label: "W2", value: 49 },
      { label: "W3", value: 52 },
      { label: "W4", value: 44 }
    ],
    reviews: [
      {
        author: "GymBusy",
        score: 4.5,
        body: "This listing is loading from Supabase. Reviews and crowd reports will become real once the backend is populated."
      }
    ]
  }));

  return {
    gyms: sortGyms(gyms),
    mode: "supabase"
  };
}

export async function loadSubmissions(): Promise<GymSubmission[]> {
  if (!isSupabaseConfigured || !supabase) {
    return seedSubmissions;
  }

  const { data, error } = await supabase.from("gym_submission_requests").select("*").order("created_at", { ascending: false });
  if (error || !data) {
    return seedSubmissions;
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.proposed_name,
    address: row.proposed_address,
    city: row.proposed_city,
    neighborhood: row.proposed_state_region ?? "Unknown",
    chainName: row.proposed_chain_name ?? "",
    notes: row.notes ?? "",
    submittedBy: row.submitted_by ?? "Member",
    createdAt: "Imported",
    status: row.status,
    duplicateGymId: row.duplicate_gym_id ?? undefined
  }));
}

export async function createCrowdReport(input: {
  gymId: string;
  level: BusynessLevel;
  user: UserProfile | null;
}) {
  if (!isSupabaseConfigured || !supabase || !input.user) {
    return { ok: true as const, mode: "seeded" as const };
  }

  const { error } = await supabase.from("busyness_reports").insert({
    gym_id: input.gymId,
    user_id: input.user.id,
    score: input.level
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const, mode: "supabase" as const };
}

export async function createGymSubmission(input: {
  form: GymSubmissionForm;
  user: UserProfile | null;
  duplicateGymId?: string;
}) {
  if (!isSupabaseConfigured || !supabase || !input.user) {
    return { ok: true as const, mode: "seeded" as const };
  }

  const { error } = await supabase.from("gym_submission_requests").insert({
    submitted_by: input.user.id,
    proposed_name: input.form.name.trim(),
    proposed_chain_name: input.form.chainName.trim() || null,
    proposed_address: input.form.address.trim(),
    proposed_city: input.form.city.trim(),
    proposed_state_region: input.form.neighborhood.trim(),
    notes: input.form.notes.trim() || null,
    duplicate_gym_id: input.duplicateGymId ?? null
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const, mode: "supabase" as const };
}

export async function createReview(input: {
  gymId: string;
  form: ReviewForm;
  user: UserProfile | null;
}): Promise<{ ok: true; review?: Review } | { ok: false; message: string }> {
  const review: Review = {
    id: `local-review-${Date.now()}`,
    author: input.user?.name ?? "Guest member",
    score: input.form.score,
    body: input.form.body.trim()
  };

  if (!isSupabaseConfigured || !supabase || !input.user) {
    return { ok: true, review };
  }

  const { error } = await supabase.from("reviews").insert({
    gym_id: input.gymId,
    user_id: input.user.id,
    score: input.form.score,
    body: input.form.body.trim()
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, review };
}
