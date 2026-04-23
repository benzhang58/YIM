import * as WebBrowser from "expo-web-browser";
import { AuthProvider, UserProfile } from "../types";
import { isSupabaseConfigured, supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithProvider(provider: AuthProvider, fallbackHomeGymId?: string): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    if (provider === "email") {
      return {
        id: "pending-email-auth",
        name: "Email login pending",
        provider,
        email: "configure@supabase-first.dev",
        homeGymId: fallbackHomeGymId
      };
    }

    return {
      id: `pending-${provider}-auth`,
      name: `${provider[0].toUpperCase()}${provider.slice(1)} auth pending`,
      provider,
      homeGymId: fallbackHomeGymId
    };
  }

  return {
    id: `mock-${provider}`,
    name: provider === "apple" ? "Avery Chen" : provider === "google" ? "Jordan Fields" : "Taylor Reed",
    email: provider === "email" ? "taylor@example.com" : undefined,
    provider,
    homeGymId: fallbackHomeGymId
  };
}
