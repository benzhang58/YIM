# GymBusy iPhone Readiness

GymBusy is intended to feel like an iPhone-first utility: fast, focused, haptic, and useful before someone leaves for the gym.

## What is configured

- Portrait orientation.
- iPhone-first support with `supportsTablet: false`.
- iOS build number in `app.json`.
- App icon at `assets/icon.png`.
- Splash image at `assets/splash.png`.
- Apple sign-in capability flag in Expo config.
- Location permission copy for nearby sorting.
- Notification permission dependency/configuration for future opt-in alerts.
- In-app account deletion request flow.
- Haptics on core actions where supported.
- Native map path for iOS through `react-native-maps`.

## iPhone QA Pass

Run these on a physical iPhone before TestFlight:

- Fresh install opens to onboarding without visual clipping.
- Bottom tabs are reachable and not hidden by the home indicator.
- Explore search, filters, save/unsave, and gym detail navigation feel instant.
- Saved gyms persist after force quit and reopen.
- Nearby asks for location permission only after tapping `Use My Location`.
- Location denial still leaves the app usable.
- Crowd report buttons trigger haptics and rate-limit messaging.
- Review submission handles empty input and success state.
- Account deletion request is easy to find under Profile.
- Email magic-link auth works with the production Supabase project.
- Apple sign-in works with production Apple/Supabase credentials.
- Splash screen and icon appear correctly in a TestFlight build.

## Owner Tasks

- Choose the final bundle identifier before App Store Connect setup.
- Replace placeholder icon/splash with final brand-approved assets if desired.
- Configure Sign in with Apple in Apple Developer and Supabase.
- Create a TestFlight build using `eas build --platform ios --profile production`.
- Test on at least one Face ID iPhone and one smaller-screen iPhone if possible.

## Useful References

- Expo app icons and splash screens: https://docs.expo.dev/guides/app-icons/
- Apple account deletion guidance: https://developer.apple.com/support/offering-account-deletion-in-your-app/
