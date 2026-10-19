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

Existing local data is preserved. On first sign-in, if that account has no cloud data, current device data is uploaded. Later sign-ins load that account's cloud data and changes are synchronized automatically. Data from a different previously signed-in account is not copied into a new account.