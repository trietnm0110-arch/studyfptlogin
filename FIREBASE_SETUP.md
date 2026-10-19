# Firebase setup

1. Create a Firebase project and register a Web app. Copy its web config into `.env.local` using the variable names in `.env.example`.
2. In Authentication, enable Email/Password and Google. Add the deployed website domain to Authentication > Settings > Authorized domains.
3. Create a Cloud Firestore database and publish these rules so each signed-in user can access only their own study data:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/private/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Restart the Vite server after adding `.env.local`. Email/password sign-in and cloud sync work with the web config. For Android Google sign-in, also register the Android app in Firebase and configure its SHA fingerprints and Google OAuth client as described in Firebase's Android setup guide.

5. To use AI study suggestions, open **AI Services > AI Logic** in Firebase Console and complete **Get started**, selecting the Gemini Developer API. The app uses Firebase AI Logic and does not need a Gemini API key in `.env.local`.
6. For local development, the app enables the App Check debug provider automatically. Open the browser developer console, copy the generated App Check debug token, and register it in Firebase Console under **App Check > Apps > Manage debug tokens**. Keep this token private and never commit it.
7. For public production use, create a score-based reCAPTCHA Enterprise web key in Google Cloud Fraud Defense with the deployed domain (for example, `trietnm0110-arch.github.io`; do not include `localhost`). Register that key for the matching Web App in Firebase **App Check > Apps**, then set it as `VITE_FIREBASE_APPCHECK_SITE_KEY` in the GitHub Actions repository variables. reCAPTCHA has a monthly no-cost assessment quota; Google Cloud may require a billing account, and usage beyond the quota can be charged.

Existing local data is preserved. On first sign-in, if that account has no cloud data, current device data is uploaded. Later sign-ins load that account's cloud data and changes are synchronized automatically. Data from a different previously signed-in account is not copied into a new account.