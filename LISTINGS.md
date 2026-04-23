# Gym listing strategy

## Recommended approach

GymBusy should use a hybrid listing model:

1. Add a starter set of gyms yourself in the first launch area.
2. Import publicly available gym/business records where licensing permits it.
3. Let users submit missing gyms.
4. Moderate or auto-merge those submissions before they become public.

This avoids the two main failure modes:

- too few gyms at launch
- too many duplicate or fake gyms later

## Canonical listing rules

- One public gym page per physical location
- Chain locations are separate listings
- Users suggest edits instead of editing canonical gyms directly
- New user-submitted gyms start in `pending`
- Duplicate detection should compare name, distance, and address similarity

## Suggested submission flow

1. User searches for a gym.
2. No match appears.
3. User taps `Add Gym`.
4. App collects:
   - name
   - address
   - city
   - optional chain name
   - optional map pin
   - optional notes or photo
5. Backend checks for a nearby duplicate.
6. If a likely match exists, mark the request as `merged` or route it to review.
7. If no likely match exists, moderator approves and creates a canonical `gym`.

## Launch recommendation

For the first version, keep operations simple:

- launch in one city first
- manually seed the main gyms
- manually review every submission
- only expand automation after there is real usage

## Why this matters

The busyness feature only works if gym identity is clean. Duplicate listings split traffic reports, reviews, and trend history, which makes the crowd score less trustworthy.
