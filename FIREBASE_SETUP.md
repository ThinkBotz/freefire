# 🔥 Firebase Setup Guide

Step-by-step. No skipping. Follow the order.

---

## ✅ STEP 1: Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. **Project name:** `free-fire-tournament` (or your choice)
4. Click **Continue**
5. **Google Analytics:** Toggle OFF (not needed)
6. Click **Create project**
7. Wait ~30 seconds for provisioning
8. Click **Continue** when ready

---

## ✅ STEP 2: Register Web App

1. In Firebase Console, click the **Web icon** `</>`
2. **App nickname:** `Tournament Dashboard`
3. **DO NOT** check "Firebase Hosting" (we'll do that later)
4. Click **Register app**
5. **COPY THE CONFIG OBJECT** that appears:

```js
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "free-fire-tournament.firebaseapp.com",
  projectId: "free-fire-tournament",
  storageBucket: "free-fire-tournament.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

6. **Paste this into:** `js/firebase-config.js`
   - Replace lines 8-14 (the placeholder values)
   - Keep the imports and export lines intact

---

## ✅ STEP 3: Enable Authentication

1. In left sidebar → **Authentication**
2. Click **Get started**
3. Click **Sign-in method** tab
4. Click **Email/Password**
5. Toggle **Enable** ON
6. Click **Save**

---

## ✅ STEP 4: Create User Accounts

### A. Create Admin Account

1. **Authentication** → **Users** tab
2. Click **Add user**
3. **Email:** `admin@yourtournament.com` (use your real email)
4. **Password:** Create strong password (save it securely)
5. Click **Add user**
6. **COPY THE UID** (long string like `Xy9kLm3nB2pQr8sT...`)
7. Open `js/admin.js` → Replace line 8:
   ```js
   const ADMIN_UID = 'Xy9kLm3nB2pQr8sT...'; // Paste your actual UID
   ```

### B. Create Coordinator Accounts (17 total)

Repeat 17 times:

1. Click **Add user**
2. **Email:** `team1@yourtournament.com` (increment: team2@, team3@, etc.)
3. **Password:** Strong unique password (store in spreadsheet)
4. Click **Add user**
5. **COPY THE UID** for each user
6. Store in this format:

```
Team 1: team1@yourtournament.com | password123 | UID: Abc123...
Team 2: team2@yourtournament.com | password456 | UID: Def456...
...
Team 17: team17@yourtournament.com | password... | UID: Xyz789...
```

**Save this list securely.** You'll need the UIDs for Firestore setup.

---

## ✅ STEP 5: Create Firestore Database

1. Left sidebar → **Firestore Database**
2. Click **Create database**
3. Select **Production mode**
4. Choose **Region:** (pick closest to your location)
   - Asia: `asia-south1` (Mumbai)
   - US: `us-central1`
   - Europe: `europe-west1`
5. Click **Enable**
6. Wait for database creation (~1 minute)

---

## ✅ STEP 6: Create Collections & Documents

### A. Create `teams` Collection

1. Click **Start collection**
2. **Collection ID:** `teams`
3. Click **Next**

**Add First Document:**

4. **Document ID:** `team01`
5. Add fields (click **Add field** for each):
   - **Field:** `name` | **Type:** string | **Value:** `Team Alpha`
   - **Field:** `kills` | **Type:** number | **Value:** `0`
   - **Field:** `placement` | **Type:** number | **Value:** `1`
   - **Field:** `score` | **Type:** number | **Value:** `0`
   - **Field:** `coordinatorUID` | **Type:** string | **Value:** `[UID from team1@ account]`
6. Click **Save**

**Add Remaining 16 Teams:**

7. Click **Add document**
8. **Document ID:** `team02`
9. Repeat fields (change `name` to "Team Bravo", use team2@ UID)
10. Repeat for `team03` through `team17`

**Team naming suggestions:**
- Team Alpha, Team Bravo, Team Charlie, Team Delta, Team Echo
- Or: Team Phoenix, Team Dragon, Team Viper, Team Thunder, etc.
- Or: Actual team names if you have them

**CRITICAL:** Each `coordinatorUID` must match the UID from Authentication tab exactly.

---

### B. Create `admin` Collection

1. Click **Start collection**
2. **Collection ID:** `admin`
3. Click **Next**
4. **Document ID:** `matchLock`
5. Add fields:
   - **Field:** `locked` | **Type:** boolean | **Value:** `false`
   - **Field:** `lastModified` | **Type:** string | **Value:** `` (empty)
6. Click **Save**

---

## ✅ STEP 7: Deploy Security Rules

1. **Firestore Database** → **Rules** tab
2. **DELETE** everything in the editor
3. **COPY** the entire content from your local file: `firestore.rules`
4. **PASTE** into the editor
5. Click **Publish**

**Expected rules:**
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /teams/{teamId} {
      allow read: if true;
      
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.coordinatorUID
        && (!exists(/databases/$(database)/documents/admin/matchLock) 
            || !get(/databases/$(database)/documents/admin/matchLock).data.locked);
    }
    
    match /admin/{document=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == 'YOUR_ADMIN_UID_HERE';
    }
  }
}
```

6. **IMPORTANT:** Replace `YOUR_ADMIN_UID_HERE` on line 17 with your actual admin UID
7. Click **Publish** again

---

## ✅ STEP 8: Test Locally

1. Open `index.html` in browser (double-click file)
2. Try logging in with `admin@yourtournament.com`
3. Should redirect to `coordinator.html` (will show error - that's normal)
4. Open browser console (F12) → Check for Firebase connection errors
5. If you see "Firebase not defined" → Check `firebase-config.js` paste

**Expected behavior:**
- Login works ✅
- No "Firebase not defined" errors ✅
- Coordinator page loads (may show loading... - normal before deployment) ✅

---

## ✅ STEP 9: Deploy to Firebase Hosting

### Install Firebase CLI (one-time)

**Windows PowerShell:**
```powershell
npm install -g firebase-tools
```

If npm not installed, download Node.js first:
- https://nodejs.org → Download LTS version → Install

### Login to Firebase

```bash
firebase login
```

Browser opens → Select your Google account → Allow access

### Initialize Project

```bash
cd "C:\Users\samxiao\OneDrive\Desktop\free_fire event"
firebase init
```

**Follow prompts:**

1. **Which features?** (Use arrow keys + spacebar)
   - [x] Firestore
   - [x] Hosting
   - Press Enter

2. **Use existing project or create new?**
   - Select: **Use an existing project**

3. **Select project:**
   - Choose your project (free-fire-tournament)

4. **Firestore Rules file?**
   - Press Enter (uses `firestore.rules`)

5. **Firestore indexes file?**
   - Press Enter (uses default)

6. **Public directory?**
   - Type: `.` (single dot)
   - Press Enter

7. **Configure as single-page app?**
   - Type: `N`
   - Press Enter

8. **Set up GitHub deploys?**
   - Type: `N`
   - Press Enter

### Deploy Everything

```bash
firebase deploy
```

Wait 30-60 seconds. You'll see:

```
✔ Deploy complete!

Hosting URL: https://free-fire-tournament.web.app
```

---

## ✅ STEP 10: Test Live Deployment

1. Open the Hosting URL in browser
2. Try logging in with coordinator account (team1@...)
3. Should see coordinator panel with Team Alpha
4. Try updating kills/placement → Submit
5. Open `https://your-url.web.app/leaderboard.html`
6. Should see team with updated score
7. Try logging in with admin account
8. Go to `https://your-url.web.app/admin.html`
9. Should see admin panel

**If everything works → You're done.** 🎉

---

## 🐛 Common Issues

### "Firebase not defined"
- Check `firebase-config.js` has correct config pasted
- Check config object format (no syntax errors)

### "Permission denied" on login
- Verify Email/Password auth enabled
- Check user exists in Authentication tab
- Try password reset if needed

### "Permission denied" on score update
- Check `coordinatorUID` in Firestore matches logged-in user UID exactly
- Check security rules published
- Check match is not locked (admin panel)

### Can't deploy (command not found)
- Install Node.js first
- Restart terminal after installing firebase-tools
- Use full path: `npx firebase deploy`

### Wrong project selected
- Run: `firebase use --add`
- Select correct project
- Give it an alias
- Run: `firebase deploy`

---

## 📋 Post-Setup Checklist

- [ ] Firebase config pasted into `firebase-config.js`
- [ ] Admin UID set in `admin.js`
- [ ] Admin UID set in `firestore.rules` (line 17)
- [ ] 1 admin account created
- [ ] 17 coordinator accounts created
- [ ] All coordinator UIDs stored securely
- [ ] `teams` collection with 17 documents
- [ ] Each team has correct `coordinatorUID`
- [ ] `admin/matchLock` document created
- [ ] Security rules deployed
- [ ] Hosted to Firebase (live URL works)
- [ ] Tested login (admin + coordinator)
- [ ] Tested score update
- [ ] Tested leaderboard display
- [ ] Tested admin panel (lock/unlock)
- [ ] Tested export (CSV/JSON/Print)

---

## 🔗 Your URLs

After deployment, you'll have:

```
Login/Coordinators: https://your-project.web.app/
Leaderboard:        https://your-project.web.app/leaderboard.html
Admin Panel:        https://your-project.web.app/admin.html
```

Share coordinator URL + credentials privately.
Share leaderboard URL publicly (project on screen, share in chat).

---

## 🎯 Next Steps

1. **Share coordinator credentials** with team leaders (SMS/email)
2. **Test lock/unlock** with a coordinator logged in
3. **Test export** (practice downloading CSV)
4. **Project leaderboard** on screen/TV for audience
5. **Keep admin panel open** on your device during tournament

---

**Ready for Friday. Execute the setup.**
