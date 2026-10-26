# Elovia Love for Android

The Android app is a native Kotlin application in `Elovia/`. It uses the existing
website backend and its MongoDB-backed `User` records; the app never connects to
MongoDB directly.

## Authentication endpoints

The existing server mounts `server/routes/auth.js` at `/api/auth`:

- `POST /api/auth/login` accepts `{ "email", "password" }`.
- `POST /api/auth/register` accepts `{ "name", "email", "password", "dateOfBirth", "gender" }`.
  The server requires a 2–50 character name, valid email, password of at least
  6 characters, ISO date of birth for someone 18 or older, and gender `Male`,
  `Female`, or `Non-binary`. A successful registration returns a JWT immediately.
- `GET /api/auth/me` verifies the saved bearer token and returns the current user.
- `POST /api/auth/logout` is a protected client-side token logout endpoint.

The backend has no password-reset endpoint. It has optional email-verification
routes (`POST /api/verify/send-email` and
`GET /api/verify/confirm-email?token=...`), but registration does not require
verification or initiate that flow. The current `send-email` route logs the
verification URL and does not deliver an email, so the app follows the actual
registration response and does not show a verification-pending state.

## Authenticated app

After the server verifies a saved JWT, the native Android app displays Home,
Discover, Matches, Chats, and Profile tabs. These use the existing protected
routes:

- `GET /api/auth/me` for the signed-in member's profile.
- `GET /api/users/discover?page=1` and `POST /api/match/swipe` with
  `{ "targetUserId", "action": "like" | "pass" }` for real discovery profiles.
- `GET /api/matches` for mutual matches.
- `GET /api/messages` for conversations, `GET /api/messages/:userId?page=1`
  for chat history, and `POST /api/messages/:userId` with `{ "content" }` to
  send messages to a match.
- `PUT /api/users/profile` to save the profile fields supported by the server.

Home combines live discovery profiles, mutual matches, recent conversations,
unread-message and notification counts, and a profile-completion percentage
calculated from the signed-in member's saved profile. Home actions navigate to
the existing app tabs; Random Video opens its existing website route.
The bundled Home inspiration photo is from Unsplash and is used under the
[Unsplash License](https://unsplash.com/license).

The app does not make up profiles, matches, messages, online indicators, or
compatibility scores. The Android profile editor updates name, bio, location,
interests, relationship goals, and profile photos through the existing
protected photo-upload endpoint. Profile photos come from the signed-in user's
backend record, including relative backend paths and data URLs. The profile
also links to notifications, membership plans, and account settings.
Notifications and membership details are fetched from the existing backend;
membership purchases remain on the website. Notification read-state controls,
advanced discovery filters, coin purchases, and real-time chat are not wired
into this Android UI. Messages are fetched when a conversation is opened;
real-time delivery is not claimed by the mobile app.

The UI follows the Android system light/dark appearance. Its shared colors,
system bars, input surfaces, navigation icons, and text adapt for each theme.
Chat messages scroll independently from the icon-based composer, which remains
anchored above the keyboard; the conversation toolbar includes an accessible
back arrow and the recipient's latest activity.

## Configure and run

From the workspace root, start the existing backend with its already-configured
environment:

```powershell
cd server
npm install
npm run dev
```

The app uses `https://elovialove-server.onrender.com` by default. You can
override it with the `ELOVIA_API_BASE_URL` environment variable or the Gradle
property `apiBaseUrl`; use a backend origin without `/api`.
For an Android Studio emulator, the development backend on the host computer is
usually reachable at `http://10.0.2.2:5000`. For a physical device, use the
computer's LAN IPv4 address, such as `http://192.168.1.20:5000`, and ensure the
phone and computer can reach each other on the same network. The backend must
listen on a network interface reachable from the device, and local firewall
rules must allow its port. Cleartext HTTP is enabled only for debug builds.

```powershell
cd Elovia
$env:ELOVIA_API_BASE_URL = "http://10.0.2.2:5000"
.\gradlew.bat testDebugUnitTest assembleDebug
adb install -r .\app\build\outputs\apk\debug\app-debug.apk
```

For a physical device, substitute the computer's actual LAN address. These
commands assume the workspace root as the starting directory; use a separate
terminal for the Android build. For a production build, keep the default or set `ELOVIA_API_BASE_URL` to the
deployed backend's **HTTPS** origin. The value is a public API address, not a
secret; do not put database credentials, JWT secrets, or other server secrets
in app build properties.

Build a debug APK configured for the deployed server with:

```powershell
$env:ELOVIA_API_BASE_URL = "https://elovialove-server.onrender.com"
.\gradlew.bat assembleDebug
```

For a physical Android device, enable USB debugging (or install the debug APK
manually), connect it to the same LAN as the computer, and replace
`10.0.2.2` with the computer's LAN IP before building. Allow the backend port
through the computer's firewall. For the emulator, keep `10.0.2.2`; `localhost`
inside the emulator refers to the emulator itself. The debug manifest permits
HTTP only in debug builds; production builds require HTTPS.

To use Android Studio, open the `Elovia/` folder and run the `app`
configuration with `ELOVIA_API_BASE_URL` set in the Gradle process environment.
The debug APK is created at `app/build/outputs/apk/debug/app-debug.apk`.
