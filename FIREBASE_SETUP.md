# Firebase Console Setup for Google Sign-In

## IMPORTANT: Add Authorized Domains

Google Sign-In won't work until you add your domain to Firebase Console.

### Steps:

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project: **groczyapp**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add these domains:
   - `localhost` (for local testing)
   - Your production domain (e.g., `groczyapp.web.app`)

### For localhost testing:
- Add: `localhost`

### For Firebase Hosting:
- Add: `groczyapp.web.app` (or your hosting URL)

### For custom domain:
- Add your custom domain

---

## Check Browser Console

If Google Sign-In still doesn't work:

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for error messages
4. Common errors:
   - "This domain is not authorized" → Add domain in Firebase Console
   - "Popup blocked" → Allow popups in browser
   - "Invalid API key" → Check firebase-config.js

---

## Test Google Sign-In

After adding authorized domains:
1. Refresh the page
2. Click "Sign in with Google"
3. Select your Google account
4. Should redirect back and login successfully

---

**Note:** Changes in Firebase Console may take a few minutes to propagate.
