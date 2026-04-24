import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { applyCrowdReport } from "../services/busyness";
import {
  createContentReport,
  createAccountDeletionRequest,
  createCrowdReport,
  createGymSubmission,
  createReview,
  loadContentReports,
  loadGyms,
  loadSubmissions,
  updateContentReportStatus
} from "../services/repository";
import { getCurrentUserProfile, signInWithProvider, signOutAuth } from "../services/auth";
import { isSupabaseConfigured, supabase } from "../services/supabase";
import { ActionLog, actionKey, formatRemainingTime, getRemainingMs, rateLimitWindows } from "../services/rateLimits";
import { findPotentialDuplicate, submissionToGym } from "../utils/listings";
import {
  AuthProvider,
  BackendMode,
  BusynessLevel,
  ContentReport,
  ContentReportForm,
  ContentReportStatus,
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
const ACTION_LOG_KEY = "gymbusy:action-log";

type AppContextValue = {
  gyms: Gym[];
  submissions: GymSubmission[];
  contentReports: ContentReport[];
  reports: CrowdReport[];
  user: UserProfile | null;
  backendMode: BackendMode;
  hydrated: boolean;
  isRefreshing: boolean;
  lastSyncMessage: string | null;
  onboardingComplete: boolean;
  refreshData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signIn: (provider: AuthProvider, email?: string) => Promise<{ message: string }>;
  signOut: () => Promise<void>;
  getGym: (gymId: string) => Gym | undefined;
  submitBusyness: (gymId: string, level: BusynessLevel) => Promise<{ ok: boolean; message?: string }>;
  submitGym: (form: GymSubmissionForm) => Promise<{ message: string; status: SubmissionStatus; ok: boolean }>;
  submitReview: (gymId: string, form: ReviewForm) => Promise<{ ok: boolean; message: string }>;
  reportContent: (form: ContentReportForm) => Promise<{ ok: boolean; message: string }>;
  updateReportStatus: (reportId: string, status: ContentReportStatus) => Promise<{ ok: boolean; message: string }>;
  requestAccountDeletion: (reason?: string) => Promise<{ ok: boolean; message: string }>;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [backendMode, setBackendMode] = useState<BackendMode>("seeded");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [submissions, setSubmissions] = useState<GymSubmission[]>([]);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actionLog, setActionLog] = useState<ActionLog>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [{ gyms: nextGyms, mode }, nextSubmissions, nextContentReports] = await Promise.all([
        loadGyms(),
        loadSubmissions(),
        loadContentReports()
      ]);
      setGyms(nextGyms);
      setSubmissions(nextSubmissions);
      setContentReports(nextContentReports);
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
      const storedActionLog = await AsyncStorage.getItem(ACTION_LOG_KEY);

      await refreshData();
      const sessionUser = await getCurrentUserProfile(gyms[0]?.id);
      setOnboardingComplete(storedOnboarding === "true");
      setUser(sessionUser ?? (storedUser ? (JSON.parse(storedUser) as UserProfile) : null));
      setActionLog(storedActionLog ? (JSON.parse(storedActionLog) as ActionLog) : {});
      setHydrated(true);
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        await AsyncStorage.removeItem(USER_KEY);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const nextUser = await getCurrentUserProfile(gyms[0]?.id);
        if (nextUser) {
          setUser(nextUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [gyms]);

  const completeOnboarding = async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  const signIn = async (provider: AuthProvider, email?: string) => {
    const result = await signInWithProvider(provider, gyms[0]?.id, email);

    if (result.user) {
      setUser(result.user);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }

    setLastSyncMessage(result.message);
    return { message: result.message };
  };

  const signOut = async () => {
    await signOutAuth();
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
    setLastSyncMessage("Signed out.");
  };

  const getGym = (gymId: string) => gyms.find((gym) => gym.id === gymId);

  const recordAction = async (key: string) => {
    const nextLog = {
      ...actionLog,
      [key]: Date.now()
    };
    setActionLog(nextLog);
    await AsyncStorage.setItem(ACTION_LOG_KEY, JSON.stringify(nextLog));
  };

  const submitBusyness = async (gymId: string, level: BusynessLevel) => {
    const actorId = user?.id ?? "guest";
    const key = actionKey("crowd", actorId, gymId);
    const remainingMs = getRemainingMs(actionLog, key, rateLimitWindows.crowdReportMs);

    if (remainingMs > 0) {
      return {
        ok: false,
        message: `Crowd reports are limited for trust. Try again in ${formatRemainingTime(remainingMs)}.`
      };
    }

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
    await recordAction(key);
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
    const actorId = user?.id ?? "guest";
    const key = actionKey("review", actorId, gymId);
    const remainingMs = getRemainingMs(actionLog, key, rateLimitWindows.reviewMs);

    if (remainingMs > 0) {
      return {
        ok: false,
        message: `Reviews are limited to keep feedback useful. Try again in ${formatRemainingTime(remainingMs)}.`
      };
    }

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
    await recordAction(key);
    return {
      ok: true,
      message: "Review submitted."
    };
  };

  const reportContent = async (form: ContentReportForm) => {
    const result = await createContentReport({
      form,
      user
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message
      };
    }

    setLastSyncMessage(result.mode === "supabase" ? "Content report sent to moderation." : "Content report captured locally.");
    setContentReports((current) => [result.report, ...current]);
    return {
      ok: true,
      message: "Report submitted to moderation."
    };
  };

  const updateReportStatus = async (reportId: string, status: ContentReportStatus) => {
    const result = await updateContentReportStatus({
      reportId,
      status
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message
      };
    }

    setContentReports((current) =>
      current.map((report) => (report.id === reportId ? { ...report, status } : report))
    );
    setLastSyncMessage(result.mode === "supabase" ? "Moderation report updated." : "Moderation report updated locally.");
    return {
      ok: true,
      message: status === "resolved" ? "Report resolved." : "Report dismissed."
    };
  };

  const requestAccountDeletion = async (reason?: string) => {
    const result = await createAccountDeletionRequest({
      user,
      reason
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message
      };
    }

    setLastSyncMessage(result.message);
    return {
      ok: true,
      message: result.message
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
      contentReports,
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
      reportContent,
      updateReportStatus,
      requestAccountDeletion,
      updateSubmissionStatus
    }),
    [gyms, submissions, contentReports, reports, user, actionLog, backendMode, hydrated, isRefreshing, lastSyncMessage, onboardingComplete]
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
