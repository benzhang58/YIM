# GymBusy Data Safety Draft

This is a working draft to help complete App Store privacy nutrition labels and Google Play Data safety. It is not legal advice.

## Data The App Is Expected To Collect

- Account data: email address, auth provider, username, display name.
- User-generated content: reviews, crowd reports, missing-gym submissions, content reports, optional account deletion notes.
- Approximate or precise location: only when the user grants location permission to sort nearby gyms.
- Device notification token: only if push notifications are enabled in a native build.

## Data Use

- Account data is used to authenticate users, associate reports with an accountable profile, and reduce spam.
- Reviews and crowd reports are used to calculate gym quality and live busyness signals.
- Missing-gym submissions are used to expand the gym listing database after moderation.
- Content reports are used to moderate misleading, spammy, or abusive content.
- Location is used to sort gyms by distance and improve nearby recommendations.
- Notification tokens may be used for future crowd alerts or product updates if the user opts in.

## User Controls

- Users can sign out from the Profile tab.
- Users can request account deletion from Profile > Account Deletion.
- Users can deny location permission and still use core app features.
- Users can deny notification permission.
- Users can report suspicious reviews or crowd data for moderation.

## Owner Tasks Before Submission

- Replace placeholder legal copy with lawyer-reviewed Privacy Policy and Terms.
- Confirm whether notification tokens are stored in production before answering store privacy forms.
- Confirm whether analytics, crash reporting, or attribution SDKs are added before answering store privacy forms.
- Publish a web-accessible account deletion path if required by Google Play policy.
