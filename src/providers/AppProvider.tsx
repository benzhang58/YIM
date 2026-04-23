import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { applyCrowdReport } from "../services/busyness";
import { createCrowdReport, createGymSubmission, createReview, loadGyms, loadSubmissions } from "../services/repository";
import { signInWithProvider } from "../services/auth";
import { findPotentialDuplicate, submissionToGym } from "../utils/listings";
import {
  AuthProvider,
  BackendMode,
  BusynessLevel,
  CrowdReport,
  Gym,
  GymSubmission,
  GymSubmissionForm,
  ReviewForm,
  SubmissionStatus,
  UserProfile
} from "../types";

const ONBOARDING_KEY = "gymbusy:onboarding-complete";
const USER_KEY = "gymbusy:mock-user";

type AppContextValue = {
  gyms: Gym[];
  submissions: GymSubmission[];
  reports: CrowdReport[];
  user: UserProfile | null;
  backendMode: BackendMode;
  hydrated: boolean;
  isRefreshing: boolean;
  lastSyncMessage: string | null;
  onboardingComplete: boolean;
  refreshData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  getGym: (gymId: string) => Gym | undefined;
  submitBusyness: (gymId: string, level: BusynessLevel) => Promise<{ ok: boolean; message?: string }>;
  submitGym: (form: GymSubmissionForm) => Promise<{ message: string; status: SubmissionStatus; ok: boolean }>;
  submitReview: (gymId: string, form: ReviewForm) => Promise<{ ok: boolean; message: string }>;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [backendMode, setBackendMode] = useState<BackendMode>("seeded");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [submissions, setSubmissions] = useState<GymSubmission[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [{ gyms: nextGyms, mode }, nextSubmissions] = await Promise.all([loadGyms(), loadSubmissions()]);
      setGyms(nextGyms);
      setSubmissions(nextSubmissions);
      setBackendMode(mode);
      setLastSyncMessage(mode === "supabase" ? "Live backend sync complete." : "Using seeded preview data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      const [storedOnboarding, storedUser] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);

      await refreshData();
      setOnboardingComplete(storedOnboarding === "true");
      setUser(storedUser ? (JSON.parse(storedUser) as UserProfile) : null);
      setHydrated(true);
    };

    hydrate();
  }, []);

  const completeOnboarding = async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  const signIn = async (provider: AuthProvider) => {
    const nextUser = await signInWithProvider(provider, gyms[0]?.id);

    setUser(nextUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const getGym = (gymId: string) => gyms.find((gym) => gym.id === gymId);

  const submitBusyness = async (gymId: string, level: BusynessLevel) => {
    const newReport: CrowdReport = {
      id: `report-${Date.now()}`,
      gymId,
      level,
      createdAt: new Date().toISOString()
    };

    const writeResult = await createCrowdReport({
      gymId,
      level,
      user
    });

    if (!writeResult.ok) {
      return {
        ok: false,
        message: writeResult.message
      };
    }

    setReports((current) => {
      const nextReports = [newReport, ...current];
      const gymReports = nextReports.filter((report) => report.gymId === gymId);

      setGyms((currentGyms) =>
        currentGyms.map((gym) => (gym.id === gymId ? applyCrowdReport(gym, level, gymReports) : gym))
      );

      return nextReports;
    });

    setLastSyncMessage(writeResult.mode === "supabase" ? "Live crowd report saved." : "Crowd report saved locally.");
    return { ok: true };
  };

  const submitGym = async (form: GymSubmissionForm) => {
    const duplicate = findPotentialDuplicate(gyms, form);
    const status: SubmissionStatus = duplicate ? "merged" : "pending";

    const submission: GymSubmission = {
      id: `submission-${Date.now()}`,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      chainName: form.chainName.trim(),
      notes: form.notes.trim(),
      submittedBy: user?.name ?? "Guest member",
      createdAt: "Just now",
      status,
      duplicateGymId: duplicate?.id
    };

    const writeResult = await createGymSubmission({
      form,
      user,
      duplicateGymId: duplicate?.id
    });

    if (!writeResult.ok) {
      return {
        status,
        ok: false,
        message: writeResult.message
      };
    }

    setSubmissions((current) => [submission, ...current]);
    setLastSyncMessage(writeResult.mode === "supabase" ? "Gym submission sent to moderation." : "Gym submission saved locally.");

    return {
      status,
      ok: true,
      message: duplicate
        ? `Likely duplicate detected. Linked to ${duplicate.name} for moderator review.`
        : "Gym submitted. It is now in the review queue."
    };
  };

  const submitReview = async (gymId: string, form: ReviewForm) => {
    const result = await createReview({
      gymId,
      form,
      user
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message
      };
    }

    if (result.review) {
      setGyms((current) =>
        current.map((gym) =>
          gym.id === gymId
            ? {
                ...gym,
                reviews: [result.review!, ...gym.reviews]
              }
            : gym
        )
      );
    }

    setLastSyncMessage(backendMode === "supabase" ? "Review submitted to backend." : "Review saved locally.");
    return {
      ok: true,
      message: "Review submitted."
    };
  };

  const updateSubmissionStatus = (submissionId: string, status: SubmissionStatus) => {
    const target = submissions.find((submission) => submission.id === submissionId);
    if (!target) {
      return;
    }

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId ? { ...submission, status, reviewedAt: "Just now" } : submission
      )
    );

    if (status === "approved" && !gyms.some((gym) => gym.name === target.name && gym.city === target.city)) {
      setGyms((current) => [submissionToGym(target, current.length), ...current]);
    }
  };

  const value = useMemo(
    () => ({
      gyms,
      submissions,
      reports,
      user,
      backendMode,
      hydrated,
      isRefreshing,
      lastSyncMessage,
      onboardingComplete,
      refreshData,
      completeOnboarding,
      signIn,
      signOut,
      getGym,
      submitBusyness,
      submitGym,
      submitReview,
      updateSubmissionStatus
    }),
    [gyms, submissions, reports, user, backendMode, hydrated, isRefreshing, lastSyncMessage, onboardingComplete]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return value;
}
