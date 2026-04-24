import * as WebBrowser from "expo-web-browser";
import { AuthProvider, UserProfile } from "../types";
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

export async function signInWithProvider(provider: AuthProvider, fallbackHomeGymId?: string): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    if (provider === "email") {
      return {
        id: "pending-email-auth",
        name: "Email login pending",
        provider,
        email: "configure@supabase-first.dev",
        homeGymId: fallbackHomeGymId,
        username: "email-member",
        joinedAt: new Date().toISOString(),
        trustScore: 75
      };
    }

    return {
      id: `pending-${provider}-auth`,
      name: `${provider[0].toUpperCase()}${provider.slice(1)} auth pending`,
      provider,
      homeGymId: fallbackHomeGymId,
      username: `${provider}-member`,
      joinedAt: new Date().toISOString(),
      trustScore: 75
    };
  }

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
