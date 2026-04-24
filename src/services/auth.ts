import * as WebBrowser from "expo-web-browser";
import { AuthProvider, AuthResult, UserProfile } from "../types";
import { isSupabaseConfigured, supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

const previewUsers: Record<AuthProvider, Pick<UserProfile, "name" | "email" | "username" | "trustScore">> = {
  apple: {
    name: "Avery Chen",
    username: "averylifts",
    trustScore: 91
  },
  google: {
    name: "Jordan Fields",
    username: "jordansets",
    trustScore: 88
  },
  email: {
    name: "Taylor Reed",
    email: "taylor@example.com",
    username: "taylortrains",
    trustScore: 84
  }
};

function toUsername(value: string, suffix?: string) {
  const username = value
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const base = username || "member";
  return suffix ? `${base}-${suffix}`.slice(0, 32) : base;
}

function createPreviewUser(provider: AuthProvider, fallbackHomeGymId?: string): UserProfile {
  const previewUser = previewUsers[provider];

  return {
    id: `mock-${provider}`,
    name: previewUser.name,
    email: previewUser.email,
    provider,
    homeGymId: fallbackHomeGymId,
    username: previewUser.username,
    joinedAt: new Date().toISOString(),
    trustScore: previewUser.trustScore
  };
}

function getUrlParam(url: string, key: string) {
  const query = url.split("?")[1]?.split("#")[0];
  if (!query) {
    return null;
  }

  return (
    query
      .split("&")
      .map((part) => part.split("="))
      .find(([name]) => decodeURIComponent(name) === key)?.[1] ?? null
  );
}

async function profileFromSession(fallbackHomeGymId?: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  const authUser = userResult.user;

  if (userError || !authUser) {
    return null;
  }

  const provider = ((authUser.app_metadata.provider as AuthProvider | undefined) ?? "email") as AuthProvider;
  const email = authUser.email ?? undefined;
  const displayName =
    (authUser.user_metadata.full_name as string | undefined) ??
    (authUser.user_metadata.name as string | undefined) ??
    email?.replace(/@.*$/, "") ??
    "GymBusy member";
  const username = toUsername((authUser.user_metadata.preferred_username as string | undefined) ?? email ?? displayName, authUser.id.slice(0, 6));

  const profilePayload = {
    id: authUser.id,
    username,
    display_name: displayName,
    email: email ?? null,
    provider,
    home_gym_id: fallbackHomeGymId ?? null,
    trust_score: 75
  };

  const { data: existing } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).maybeSingle();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .upsert({
      ...profilePayload,
      home_gym_id: existing?.home_gym_id ?? profilePayload.home_gym_id,
      trust_score: existing?.trust_score ?? profilePayload.trust_score
    })
    .select("*")
    .single();

  if (error || !profile) {
    return {
      id: authUser.id,
      name: displayName,
      email,
      provider,
      homeGymId: fallbackHomeGymId,
      username,
      joinedAt: authUser.created_at,
      trustScore: 75
    };
  }

  return {
    id: profile.id,
    name: profile.display_name ?? displayName,
    email: profile.email ?? email,
    provider: (profile.provider ?? provider) as AuthProvider,
    homeGymId: profile.home_gym_id ?? undefined,
    username: profile.username,
    joinedAt: profile.created_at,
    trustScore: profile.trust_score ?? 75
  };
}

export async function getCurrentUserProfile(fallbackHomeGymId?: string) {
  return profileFromSession(fallbackHomeGymId);
}

export async function signInWithProvider(
  provider: AuthProvider,
  fallbackHomeGymId?: string,
  email?: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      user: createPreviewUser(provider, fallbackHomeGymId),
      message: "Preview sign-in active. Add Supabase keys to use production auth."
    };
  }

  if (provider === "email") {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      return {
        user: null,
        message: "Enter an email address to receive a secure sign-in link."
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true
      }
    });

    return {
      user: null,
      message: error ? error.message : `Magic link sent to ${normalizedEmail}. Open it on this device to finish signing in.`
    };
  }

  const redirectTo = "gymbusy://auth";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error || !data.url) {
    return {
      user: null,
      message: error?.message ?? "Unable to start OAuth sign-in."
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    return {
      user: null,
      message: "Sign-in was cancelled before completion."
    };
  }

  const code = getUrlParam(result.url, "code");
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(decodeURIComponent(code));
    if (exchangeError) {
      return {
        user: null,
        message: exchangeError.message
      };
    }
  }

  const profile = await profileFromSession(fallbackHomeGymId);
  return {
    user: profile,
    message: profile ? "Signed in successfully." : "OAuth completed. Restart the app if the session does not appear."
  };
}

export async function signOutAuth() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}
