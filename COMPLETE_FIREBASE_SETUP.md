# 🔥 Complete Firebase Setup - Username Login System

Follow these steps **exactly** in order.

---

## ✅ STEP 1: Enable Authentication

1. Go to **https://console.firebase.google.com**
2. Select your project: **freefire-thinkbotz**
3. Left sidebar → Click **Authentication**
4. Click **Get started** button
5. Click **Sign-in method** tab
6. Click **Email/Password** row
7. Toggle **Enable** to ON
8. Click **Save**

---

## ✅ STEP 2: Create Admin Account

1. Still in **Authentication** → Click **Users** tab
2. Click **Add user** button
3. Fill in:
   - **Email:** `admin@thinkbotz.com`
   - **Password:** Create a strong password (example: `Admin@2025!Secure`)
   - **SAVE THIS PASSWORD SOMEWHERE SAFE**
4. Click **Add user**
5. **COPY THE UID** (long string that appears in the UID column)
   - Example: `Xy9kLm3nB2pQr8sT7vC9dE1fG3hJ5kL7`
6. Keep this UID - you'll need it in Step 4

---

## ✅ STEP 3: Create 17 Team Coordinator Accounts

Repeat the following **17 times** (one for each team):

### Team 1:
1. Click **Add user**
2. **Email:** `team1@thinkbotz.com`
3. **Password:** Choose a password (example: `Team1Pass!2025`)
   - Use different password for each team for security
   - **OR** use same password for all teams for simplicity
4. Click **Add user**
5. **COPY THE UID** from the table
6. Save in a spreadsheet/document:

```
Team 1:
  Email: team1@thinkbotz.com
  Username: team1
  Password: Team1Pass!2025
  UID: [paste the UID here]

Team 2:
  Email: team2@thinkbotz.com
  Username: team2
  Password: Team2Pass!2025
  UID: [paste the UID here]

...continue for all 17 teams
```

### Complete list of emails to create:
```
team1@thinkbotz.com
team2@thinkbotz.com
team3@thinkbotz.com
team4@thinkbotz.com
team5@thinkbotz.com
team6@thinkbotz.com
team7@thinkbotz.com
team8@thinkbotz.com
team9@thinkbotz.com
team10@thinkbotz.com
team11@thinkbotz.com
team12@thinkbotz.com
team13@thinkbotz.com
team14@thinkbotz.com
team15@thinkbotz.com
team16@thinkbotz.com
team17@thinkbotz.com
```

**Password recommendations:**
- **Option 1 (Secure):** Different password per team
  - `Team1Pass!`, `Team2Pass!`, etc.
- **Option 2 (Simple):** Same password for all
  - `Tournament2025!` for all 17 teams
  - Easier to distribute, coordinators only know their username

---

## ✅ STEP 4: Configure Admin UID in Code

1. Open your project folder: `c:\Users\samxiao\OneDrive\Desktop\free_fire event`
2. Open file: `js\admin.js` in text editor
3. Find line 8 (should say):
   ```js
   const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';
   ```
4. Replace with your actual admin UID from Step 2:
   ```js
   const ADMIN_UID = 'Xy9kLm3nB2pQr8sT7vC9dE1fG3hJ5kL7';
   ```
5. **Save the file**

---

## ✅ STEP 5: Create Firestore Database

1. Firebase Console → Left sidebar → **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Click **Next**
5. **Cloud Firestore location:** Choose closest to you
   - For India: `asia-south1 (Mumbai)`
   - For USA: `us-central1 (Iowa)`
6. Click **Enable**
7. Wait ~1 minute for database creation

---

## ✅ STEP 6: Create Teams Collection

### Create the collection:
1. Click **Start collection**
2. **Collection ID:** Type `teams`
3. Click **Next**

### Add Team 1 document:
4. **Document ID:** Type `team01`
5. Click **Add field** and fill:

| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `Team Alpha` |
| `kills` | number | `0` |
| `placement` | number | `1` |
| `score` | number | `0` |
| `coordinatorUID` | string | `[paste team1 UID from Step 3]` |

6. Click **Save**

### Add remaining 16 teams:

7. Click **Add document**
8. **Document ID:** `team02`
9. Add same 5 fields:
   - `name`: `Team Bravo` (or any name you want)
   - `kills`: `0`
   - `placement`: `1`
   - `score`: `0`
   - `coordinatorUID`: `[paste team2 UID from Step 3]`
10. Click **Save**

**Repeat for all 17 teams:**

| Document ID | Name | coordinatorUID |
|-------------|------|----------------|
| `team01` | Team Alpha | team1's UID |
| `team02` | Team Bravo | team2's UID |
| `team03` | Team Charlie | team3's UID |
| `team04` | Team Delta | team4's UID |
| `team05` | Team Echo | team5's UID |
| `team06` | Team Foxtrot | team6's UID |
| `team07` | Team Golf | team7's UID |
| `team08` | Team Hotel | team8's UID |
| `team09` | Team India | team9's UID |
| `team10` | Team Juliett | team10's UID |
| `team11` | Team Kilo | team11's UID |
| `team12` | Team Lima | team12's UID |
| `team13` | Team Mike | team13's UID |
| `team14` | Team November | team14's UID |
| `team15` | Team Oscar | team15's UID |
| `team16` | Team Papa | team16's UID |
| `team17` | Team Quebec | team17's UID |

**CRITICAL:** Each `coordinatorUID` must match EXACTLY the UID from Authentication for that team's email.

---

## ✅ STEP 7: Create Admin Collection

1. In Firestore, click **Start collection** (or if you're in teams collection, click the back arrow to root)
2. **Collection ID:** Type `admin`
3. Click **Next**
4. **Document ID:** Type `matchLock`
5. Add fields:

| Field Name | Type | Value |
|------------|------|-------|
| `locked` | boolean | `false` |
| `lastModified` | string | `` (leave empty) |

6. Click **Save**

---

## ✅ STEP 8: Deploy Security Rules

1. In Firestore → Click **Rules** tab (top of page)
2. **DELETE ALL** text in the editor
3. Copy this code and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams collection
    match /teams/{teamId} {
      // Anyone can read leaderboard
      allow read: if true;
      
      // Only assigned coordinator can update their team
      // AND match must not be locked
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.coordinatorUID
        && (!exists(/databases/$(database)/documents/admin/matchLock) 
            || !get(/databases/$(database)/documents/admin/matchLock).data.locked);
    }
    
    // Admin collection
    match /admin/{document=**} {
      // Anyone can read lock status
      allow read: if true;
      
      // Only admin can write (REPLACE WITH YOUR ADMIN UID)
      allow write: if request.auth != null 
        && request.auth.uid == 'YOUR_ADMIN_UID_HERE';
    }
  }
}
```

4. **CRITICAL:** Replace `YOUR_ADMIN_UID_HERE` on line 24 with your actual admin UID from Step 2
   - Example: Change to `'Xy9kLm3nB2pQr8sT7vC9dE1fG3hJ5kL7'`
   - **Keep the single quotes!**

5. Click **Publish** button

---

## ✅ STEP 9: Test Locally (Before Deployment)

1. Open file explorer: `c:\Users\samxiao\OneDrive\Desktop\free_fire event`
2. Double-click `index.html` to open in browser

### Test Coordinator Login:
3. Make sure **Coordinator** tab is selected
4. Enter:
   - **Username:** `team1`
   - **Password:** [password you set for team1]
5. Click **Login as Coordinator**
6. Should redirect to `coordinator.html`
7. Should show "Team Alpha" at top
8. **If you see errors:** Open browser console (F12) and check for Firebase errors

### Test Admin Login:
9. Open `index.html` again (or logout)
10. Click **Admin** tab
11. Enter:
    - **Email:** `admin@thinkbotz.com`
    - **Password:** [admin password from Step 2]
12. Click **Login as Admin**
13. Should redirect to `admin.html`
14. Should see admin control panel

**If both logins work → Proceed to Step 10**

---

## ✅ STEP 10: Deploy to Firebase Hosting

### Install Node.js (if not already installed):
1. Go to **https://nodejs.org**
2. Download **LTS version** (v20.x or newer)
3. Install with default settings
4. Restart your command prompt/PowerShell after install

### Install Firebase Tools:
5. Open **PowerShell** or **Command Prompt**
6. Run:
   ```bash
   npm install -g firebase-tools
   ```
7. Wait for installation (~1 minute)

### Login to Firebase:
8. Run:
   ```bash
   firebase login
   ```
9. Browser opens → Select your Google account → Click **Allow**

### Initialize Project:
10. Navigate to your project folder:
    ```bash
    cd "C:\Users\samxiao\OneDrive\Desktop\free_fire event"
    ```

11. Run:
    ```bash
    firebase init
    ```

12. **Answer prompts:**
    - **Which features?** Use arrow keys + spacebar:
      - [x] Firestore
      - [x] Hosting
      - Press **Enter**
    
    - **Use existing project or create new?**
      - Select: **Use an existing project**
    
    - **Select project:**
      - Choose: **freefire-thinkbotz**
    
    - **Firestore Rules file?**
      - Press **Enter** (uses `firestore.rules`)
    
    - **Firestore indexes file?**
      - Press **Enter** (uses default)
    
    - **Public directory?**
      - Type: `.` (single dot)
      - Press **Enter**
    
    - **Configure as single-page app?**
      - Type: `N`
      - Press **Enter**
    
    - **Set up automatic builds?**
      - Type: `N`
      - Press **Enter**

### Deploy:
13. Run:
    ```bash
    firebase deploy
    ```

14. Wait 30-60 seconds

15. You'll see:
    ```
    ✔ Deploy complete!
    
    Hosting URL: https://freefire-thinkbotz.web.app
    ```

---

## ✅ STEP 11: Test Live Deployment

### Test Coordinator Login:
1. Open: `https://freefire-thinkbotz.web.app`
2. Username: `team1`
3. Password: [team1 password]
4. Login → Should show Team Alpha panel
5. Try updating kills to `5`, placement to `3`
6. Click **Update Score**
7. Should see success message

### Test Leaderboard:
8. Open: `https://freefire-thinkbotz.web.app/leaderboard.html`
9. Should see Team Alpha with updated score

### Test Admin Panel:
10. Open: `https://freefire-thinkbotz.web.app/admin.html`
11. Login with admin email
12. Try clicking **Lock Match**
13. Should see status change to 🔒

### Test Lock Enforcement:
14. Open coordinator panel again (team1)
15. Try updating score while locked
16. Should see: "🔒 Match is locked"

**If all tests pass → You're done! 🎉**

---

## 📋 Quick Reference

### Your URLs:
```
Coordinator Login: https://freefire-thinkbotz.web.app/
Leaderboard:       https://freefire-thinkbotz.web.app/leaderboard.html
Admin Panel:       https://freefire-thinkbotz.web.app/admin.html
```

### Coordinator Credentials Format:
```
Team 1:
  Username: team1
  Password: [your password]

Team 2:
  Username: team2
  Password: [your password]

...and so on
```

### Admin Credentials:
```
Email: admin@thinkbotz.com
Password: [your admin password]
```

---

## 🐛 Troubleshooting

**"Permission denied" when updating score:**
- Check `coordinatorUID` in Firestore matches Auth UID exactly
- Check security rules are published
- Check match is not locked (admin panel)

**"Invalid username" on login:**
- Username must be exactly: `team1`, `team2`, etc. (lowercase)
- Check user exists in Firebase Auth with email `teamX@thinkbotz.com`

**Can't deploy - command not found:**
- Install Node.js first
- Restart terminal after installing firebase-tools
- Try: `npx firebase deploy`

**Wrong team shows up after login:**
- Check Firestore `coordinatorUID` matches logged-in user's UID
- Check `coordinator.js` is loading correct team

---

## ✅ Final Checklist

Before tournament day:

- [ ] Firebase config in `firebase-config.js` ✅ (already done)
- [ ] Admin UID in `admin.js` line 8
- [ ] Admin UID in `firestore.rules` line 24
- [ ] Authentication enabled (Email/Password)
- [ ] 1 admin account created
- [ ] 17 coordinator accounts created (team1-team17@thinkbotz.com)
- [ ] All UIDs saved in spreadsheet
- [ ] Firestore `teams` collection with 17 documents
- [ ] Each team document has correct `coordinatorUID`
- [ ] Firestore `admin/matchLock` document created
- [ ] Security rules deployed
- [ ] Site deployed to Firebase Hosting
- [ ] Tested coordinator login (at least 1 team)
- [ ] Tested score update
- [ ] Tested leaderboard display
- [ ] Tested admin panel
- [ ] Tested match lock feature
- [ ] Coordinator credentials distributed to teams

---

**Follow this guide step by step. Don't skip. Friday is close.**
