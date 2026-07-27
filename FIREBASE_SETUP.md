# Firebase setup — application submissions

The application form (`/apply`) writes each submission to a **Firestore**
collection called `applications`. It uses the Firebase **Web SDK** directly from
the browser; access is controlled by Firestore **security rules** (below), not by
keeping the config secret — the web config keys are safe to expose.

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (or use an
   existing one).
2. In the project, open **Build → Firestore Database → Create database**.
   - Start in **production mode** (we lock it down with rules below).
   - Pick a location close to your users (e.g. `asia-south1` for India).
3. Register a **Web app**: Project settings (gear icon) → **General** → *Your
   apps* → **</> (Web)** → give it a nickname → **Register app**.
4. Firebase shows a `firebaseConfig = { ... }` snippet. Those are the values you
   send me / paste into the env file below.

## 2. Values to fill in

Put these in **`.env.local`** for local dev, and add the same keys in **Vercel →
Project → Settings → Environment Variables** for production. Map them from the
`firebaseConfig` snippet:

| Env var | From firebaseConfig | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` | `your-app.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` | `your-app` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `your-app.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `1234567890` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` | `1:1234567890:web:abc123` |

After adding them locally, restart `npm run dev`. On Vercel, redeploy so the
values are baked into the client bundle.

## 3. Firestore security rules

Paste these into **Firestore Database → Rules → Publish**. They allow the public
form to *create* a submission (with basic validation) but block all client-side
reading, editing, and deleting — you read submissions from the Firebase console
(or a future admin panel using the Admin SDK).

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{doc} {
      // Only you (console / Admin SDK) can read or change submissions.
      allow read, update, delete: if false;

      // Anyone can submit an application, within these limits.
      allow create: if
        request.resource.data.status == 'new'
        && request.resource.data.source == 'website'
        && request.resource.data.createdAt == request.time
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() < 200
        && request.resource.data.phone is string
        && request.resource.data.phone.size() > 0
        && request.resource.data.phone.size() < 60
        && request.resource.data.summary is string
        && request.resource.data.summary.size() < 8000;
    }
  }
}
```

## 4. Where submissions land

Each submission is a document in the `applications` collection with:

- every answer as its own field (`name`, `phone`, `work`, `why`, `frustration`,
  `meaning`, `goal`, `activity`, `injuries`, `access`, `diet`, `commitment`,
  `investment`)
- `summary` — a readable, numbered version of the whole application
- `status: "new"`, `source: "website"`, `createdAt` (server timestamp)

View them at **Firestore Database → Data → applications**.

## 5. Admin panel (`/admin`)

The admin panel lists every submission. Because client reads are blocked by the
rules above, it reads server-side with the **Firebase Admin SDK** and is gated by
a simple password.

### Values to add

| Env var | What it is |
| --- | --- |
| `ADMIN_PASSWORD` | Any password you choose — used to log into `/admin`. |
| `FIREBASE_ADMIN_PROJECT_ID` | `project_id` from the service account JSON. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `client_email` from the service account JSON. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `private_key` from the service account JSON (paste the whole value, keep the `\n` sequences as-is). |

Unlike the `NEXT_PUBLIC_*` keys, these are **secrets** — never commit them, and in
Vercel add them as normal (non-public) env vars.

### Getting the service account

Firebase console → **Project settings → Service accounts → Generate new private
key** → download the JSON. Copy `project_id`, `client_email`, and `private_key`
into the three env vars above.

On Vercel, paste the `private_key` value exactly (it contains `\n` escape
sequences); the code converts them to real newlines.

Then visit **`/admin`**, enter `ADMIN_PASSWORD`, and you'll see the submissions
(newest first), each with name, phone (click to call), timestamp, and the full
application.

## Optional hardening (later)

- **App Check** (reCAPTCHA) to stop bots writing to Firestore.
- A proper **admin panel** reading via the Admin SDK, plus **Resend** email
  notifications on each new submission — this is the next step we discussed.
