# GymBusy Launch Checklist

This file separates code-side launch work from items that require the app owner, developer accounts, production credentials, or legal review.

## Done in the codebase

- Expo app shell with onboarding, explore, nearby, add gym, moderation queue, profile, privacy, terms, and account deletion screens.
- Supabase repository layer for gyms, reviews, crowd reports, missing-gym submissions, content reports, and account deletion requests.
- Supabase schema and RLS policies for production tables.
- Supabase auth scaffolding with persisted sessions, email magic-link flow, and Apple/Google OAuth initiation.
- Seeded preview mode when Supabase environment variables are not configured.
- Rate limits for crowd reports and reviews.
- User-facing moderation/reporting flow.
- EAS build profiles for development, preview, and production.

## Owner actions before store submission

- Create and pay for an Apple Developer account.
- Create and pay for a Google Play Developer account.
- Create the production Supabase project.
- Apply `supabase/schema.sql`, then `supabase/policies.sql`, then optionally `supabase/seed.sql`.
- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to local `.env` and EAS environment variables.
- Configure Supabase Auth providers for Email, Apple, and Google.
- Add redirect URL `gymbusy://auth` in Supabase Auth URL configuration.
- Replace placeholder Privacy Policy, Terms of Service, and Account Deletion copy with lawyer-reviewed text.
- Decide final bundle ID/package name. Current placeholder is `com.gymbusy.app`.
- Provide final support email, support URL, privacy URL, and marketing website URL.
- Create final App Store and Google Play listing copy, screenshots, icon, and splash assets.
- Create a reviewer/test account if the stores need authenticated access.

## Final technical gates

- Run on a physical iPhone through TestFlight.
- Run on a physical Android device through Google Play Internal Testing.
- Confirm email magic-link auth works on real devices.
- Confirm Apple and Google sign-in work with production credentials.
- Confirm live Supabase writes for reviews, crowd reports, submissions, content reports, and deletion requests.
- Confirm account deletion requests are operationally monitored and processed.
- Confirm location permission copy and notification permission copy match actual app behavior.
- Confirm no seeded preview data appears in production unless intentionally seeded.

## Build and submit commands

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```
