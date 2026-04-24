# CONCEPT 

## What is in this scaffold

- An Expo + React Native mobile app structure
- Real screen architecture with onboarding, explore, map, submission, moderation, profile, and legal flows
- Seeded fallback data with repository abstraction ready for Supabase
- A working missing-gym submission flow with duplicate detection and moderation states
- Trend views for live, weekly, and monthly traffic patterns
- EAS build config and store-readiness scaffolding

## Product direction

Core user flow:

1. Search for a gym.
2. Check the current busyness score.
3. See expected peak hours over time.
4. Read recent member notes about equipment and crowding.
5. Submit a quick crowd report after arriving.

## Production architecture

Recommended launch stack:

- Mobile app: Expo / React Native
- Backend: Supabase or Firebase
- Auth: Apple, Google, email magic link
- Database tables:
  - `gyms`
  - `gym_locations`
  - `busyness_reports`
  - `reviews`
  - `gym_submission_requests`
  - `gym_edit_suggestions`
  - `gym_photos`
  - `user_profiles`
- Analytics:
  - rolling 15-minute live crowd score
  - hourly averages by weekday
  - monthly seasonality snapshots

## How gym listings should work

Use a hybrid listing model:

1. Seed gyms for launch cities.
2. Import additional gyms from public/place data where licensing allows.
3. Let members submit missing gyms.
4. Review submissions before publishing them live.

That keeps the marketplace broad enough to be useful without letting duplicate or fake locations pollute the app.

## How live busyness should work

- Each user submits a simple crowd rating like 25, 50, 75, or 95.
- Reports decay over time so stale reports matter less.
- The app computes a weighted average with more emphasis on recent check-ins.
- A confidence label should appear when the report count is low.
- Crowd reports should be rate-limited per user and gym to prevent one account from distorting the live score.
- Reviews should be limited per user and gym window, then routed through content reporting if members flag abuse.

Suggested formula:

`weighted_score = sum(report_score * freshness_weight) / sum(freshness_weight)`

Where `freshness_weight` drops over 90 minutes.

## Production setup

1. Create a Supabase project.
2. Apply [supabase/schema.sql](/Users/benzhang/Desktop/PROJECTS/GYMBUSY/supabase/schema.sql), then [supabase/policies.sql](/Users/benzhang/Desktop/PROJECTS/GYMBUSY/supabase/policies.sql), then optionally [supabase/seed.sql](/Users/benzhang/Desktop/PROJECTS/GYMBUSY/supabase/seed.sql).
3. Copy `.env.example` to `.env` and fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Configure auth providers in Supabase:
   - Apple
   - Google
   - Email magic link
5. Add EAS credentials and build with [eas.json](/Users/benzhang/Desktop/PROJECTS/GYMBUSY/eas.json).

## App Store path

This scaffold is intentionally close to a real React Native app. To move it toward release:

1. Configure the real backend and auth providers.
2. Replace placeholder legal copy with lawyer-reviewed documents.
3. Connect moderation, account deletion, and notifications to the backend.
4. Add real app icons, splash assets, screenshots, and store metadata.
5. Create EAS builds for internal testing.
6. Test on physical iOS and Android devices.
7. Submit to App Store Connect and Google Play Console.

## Current limitation

This project now boots locally, but it still uses seeded fallback data until you connect a real Supabase project and populate it.
