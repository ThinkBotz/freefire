# 🔥 CRITICAL SETUP STEPS

Read this BEFORE deploying. Skip steps = system breaks.

---

## ⚠️ MANDATORY PRE-FLIGHT

### 1. Firebase Config (NON-NEGOTIABLE)

Open `js/firebase-config.js` and replace ALL placeholder values:

```js
const firebaseConfig = {
    apiKey: "AIza...",              // From Firebase Console
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123:web:abc123"
};
```

**Where to get these:**
Firebase Console → Project Settings → Your apps → Web app config

---

### 2. Coordinator UID Mapping (CRITICAL)

After creating Auth accounts, you MUST link them to teams.

**Process:**

1. Go to Firebase **Authentication** tab
2. Copy each user's **UID** (long alphanumeric string)
3. Go to **Firestore** → `teams` collection
4. For each team document, paste correct UID into `coordinatorUID` field

**Example:**

| Auth Email | UID (from Auth tab) | Team Doc | coordinatorUID field |
|------------|---------------------|----------|----------------------|
| team1@... | `Xy9kLm3nB...` | `team01` | `Xy9kLm3nB...` |
| team2@... | `Pq8rTs7vC...` | `team02` | `Pq8rTs7vC...` |

**THIS IS HOW SECURITY WORKS.** Wrong UID = coordinator can't update.

---

### 3. Team Document Template

Create 17 documents in `teams` collection. Each must have:

```json
{
  "name": "Team Alpha",           // Display name
  "kills": 0,                     // Starting kills
  "placement": 1,                 // Starting placement
  "score": 0,                     // Starting score
  "coordinatorUID": "PASTE_UID_HERE"  // From Auth tab
}
```

**Document IDs:** Use consistent format
- `team01`, `team02`, ... `team17` ✅
- NOT `Team 1`, `team_1`, `Team01` ❌

---

### 4. Security Rules Deployment

Copy `firestore.rules` content → Firebase Console → Firestore → Rules → Publish

**Test it:**
1. Login as `team1@...`
2. Try updating `team01` → should work ✅
3. Try updating `team02` → should fail ❌

If both work, your rules are BROKEN. Fix them.

---

### 5. Coordinator Account Credentials

**Store these SECURELY:**

```
Team 1: team1@yourtournament.com | password123  
Team 2: team2@yourtournament.com | password456
...
```

Use strong passwords. SMS/email them to coordinators privately.

**DO NOT:**
- Share passwords in group chat
- Use same password for all teams
- Write them on public whiteboard

---

### 6. Test BEFORE Tournament

**Full test sequence:**

1. Login as `team1@...`
2. Update kills to 5, placement to 3
3. Check leaderboard → score should update
4. Logout
5. Login as `team2@...`
6. Try editing team01 → should fail
7. Update team02 → should work
8. Check leaderboard → both teams visible

If ANY step fails, DO NOT proceed. Debug first.

---

## 🚀 Deployment Commands

```bash
# One-time setup
npm install -g firebase-tools
firebase login

# In project folder
firebase init
# Select: Firestore, Hosting
# Use existing project
# Firestore rules: firestore.rules
# Public directory: . (current folder)
# Single-page app: No
# GitHub deploys: No

# Deploy
firebase deploy

# Get your URL
# Output: Hosting URL: https://your-app.web.app
```

---

## 📱 Share URLs

**Coordinators:** `https://your-app.web.app/`  
(Login → coordinator panel)

**Public/Audience:** `https://your-app.web.app/leaderboard.html`  
(No login, read-only)

---

## 🛠️ Common Errors & Fixes

### "Permission denied" on score update
- Check `coordinatorUID` in Firestore matches logged-in user UID
- Verify security rules deployed

### "Firebase not defined"
- Check `firebase-config.js` has correct values
- Ensure file is loaded BEFORE other JS files

### Leaderboard shows "Loading..." forever
- Check browser console (F12)
- Verify Firestore has `teams` collection with data
- Confirm security rules allow `read: if true`

### Login page redirects to itself
- Check Firebase Auth is enabled
- Verify email/password sign-in method is ON
- Confirm credentials exist in Auth tab

---

## 🔒 Production Security Hardening

### Before going live:

1. **Change all coordinator passwords** from test values
2. **Set up admin account** (see ADMIN_GUIDE.md)
3. **Create `admin/matchLock` document** in Firestore
4. **Enable 2FA** for Firebase Console access (your admin account)
5. **Review Firestore Rules** one more time
6. **Disable unused sign-in methods** (only Email/Password needed)
7. **Set up Firebase billing alerts** (free tier = 50k reads/day, should be fine)

---

## 🎯 Tournament Day Protocol

### 30 minutes before:

- [ ] Test leaderboard loads on phone + laptop
- [ ] Test one coordinator login
- [ ] Confirm all team scores = 0
- [ ] Share leaderboard URL in audience chat/screen

### During matches:

- [ ] Monitor leaderboard display (project to screen)
- [ ] Have Firebase Console open (check for errors)
- [ ] Keep one backup laptop with coordinator access

### Emergency contacts:

- Firebase Console: `console.firebase.google.com`
- Your project: `console.firebase.google.com/project/YOUR_PROJECT_ID`

---

## 📊 Post-Tournament

### Export final standings:

1. Firestore Console → `teams` collection
2. Click "..." → Export (JSON/CSV)
3. Archive for records

### Clean up (optional):

```bash
firebase hosting:disable  # Turn off public URL
```

Or keep it live for next tournament.

---

## 🆘 Nuclear Option (Reset Everything)

If system breaks beyond repair:

1. Firestore → Delete all `teams` documents
2. Re-create from template
3. Verify `coordinatorUID` mappings
4. Re-deploy security rules
5. Test again

**Time cost:** ~15 minutes

---

**You're ready.** No excuses. Execute.
