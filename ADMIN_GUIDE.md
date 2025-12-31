# 🔥 Admin Panel Guide

Control the entire tournament from one screen. No mercy.

---

## 🔐 Access

**URL:** `https://your-app.web.app/admin.html`

**Login:** Use your **admin account** (NOT coordinator accounts)

---

## 🛠️ Setup Admin Account

### Step 1: Create Admin User in Firebase Auth

1. Firebase Console → Authentication → Add User
2. Email: `admin@yourtournament.com` (or your actual email)
3. Set strong password
4. **Copy the UID** (long string like `Xy9kLm3nB2pQr8sT...`)

### Step 2: Add UID to Code

Open `js/admin.js` and replace this line:

```js
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';
```

With your actual UID:

```js
const ADMIN_UID = 'Xy9kLm3nB2pQr8sT7vC9dE...';
```

### Step 3: Create Admin Collection

In Firestore Console:

1. Create collection: `admin`
2. Add document ID: `matchLock`
3. Fields:
   ```json
   {
     "locked": false,
     "lastModified": ""
   }
   ```

---

## 🎮 Features

### 🔒 Match Lock/Unlock

**What it does:**
- When **LOCKED**: Coordinators cannot update scores
- When **UNLOCKED**: Normal operations

**When to use:**
- Lock BEFORE match starts (prevents accidental early updates)
- Lock AFTER scores verified (freeze final standings)
- Unlock during match (allow live updates)

**How to use:**
1. Click "Lock Match" button
2. Status changes to red 🔒
3. All coordinator panels disabled instantly
4. Click again to unlock

---

### ⚠️ Reset All Scores

**What it does:**
- Sets ALL teams to: `kills: 0`, `placement: 0`, `score: 0`
- **CANNOT BE UNDONE**

**When to use:**
- Start of new round/match
- Emergency do-over

**Safety:**
- Requires typing "RESET" to confirm
- Double confirmation prompt

---

### 🎯 Override Team Score

**What it does:**
- Manually set any team's kills, placement, score
- Bypasses coordinator permissions

**When to use:**
- Coordinator made mistake
- Technical issues during match
- Dispute resolution

**How to use:**
1. Select team from dropdown
2. Enter kills (0+)
3. Enter placement (1-17)
4. Click "Override Score"
5. Confirm prompt

Score auto-calculates using placement points.

---

### 📊 Quick Stats

**Real-time display:**
- Total Teams (should be 17)
- Total Kills (across all teams)
- Highest Score (current leader)
- Last Update (timestamp)

Auto-refreshes when any team updates.

---

### 📋 Team Overview

Live list of all teams, sorted by score (same as leaderboard).

Shows:
- Rank
- Team name
- Kills (K)
- Placement (P)
- Total score

Updates in real-time.

---

### 📥 Export Match Data

**Three export formats:**

**1. CSV Export**
- Downloads: `tournament_standings_YYYY-MM-DD.csv`
- Format: Rank, Team Name, Kills, Placement, Score
- Opens in Excel/Google Sheets
- Perfect for: Spreadsheet analysis, records

**2. JSON Export**
- Downloads: `tournament_data_YYYY-MM-DD.json`
- Format: Structured JSON with metadata
- Includes: timestamp, total stats, team array
- Perfect for: Archiving, data analysis, API integration

**3. Print Report**
- Opens formatted HTML report in new window
- Includes: Top 3 highlighted, stats summary, timestamp
- Click "Print Report" button to print/save as PDF
- Perfect for: Physical records, certificates, announcements

**When to export:**
- After each match (for records)
- Before resetting scores
- End of tournament (final standings)
- When someone asks "who won round 2?"

**Auto-naming:**
Files include timestamp to prevent overwriting previous exports.

---

## 🚨 Tournament Day Workflow

### Before Match Starts (5 min before)

1. **Lock match** 🔒
2. Verify all teams show `0` kills, `0` score
3. If not → Reset All Scores
4. Keep admin panel open

### Match Begins

1. **Unlock match** 🔓
2. Coordinators can now update
3. Monitor Team Overview section
4. Watch for suspicious updates

### Match Ends

1. **Lock match** 🔒 (immediately)
2. Verify all teams updated
3. **Export standings** (CSV + JSON for backup)
4. Check for ties (same score)
5. If corrections needed → Override Team Score

### Between Rounds

1. Confirm final standings with organizers
2. **Export round results** (keep historical record)
3. **Reset All Scores** (if starting fresh)
4. **Lock match** before announcing next match

---

## 🔐 Security

**Admin panel requires:**
- Valid Firebase Auth login
- UID matches `ADMIN_UID` in `admin.js`

**If someone unauthorized accesses:**
- They're redirected to login
- Alert shown: "Access Denied"
- Logged out automatically

**Protect your admin credentials:**
- Don't share admin email/password
- Don't leave admin panel open on public screen
- Use strong password

---

## 🐛 Troubleshooting

**"Access Denied" when I login:**
- Verify `ADMIN_UID` in `admin.js` matches your Firebase Auth UID exactly
- Check you're using admin account, not coordinator account

**Lock button not working:**
- Verify `admin/matchLock` document exists in Firestore
- Check browser console for errors

**Override not working:**
- Verify you have write permissions in Firestore Rules
- Check `admin` collection rules allow admin UID

**Stats show 0 teams:**
- Verify `teams` collection has documents
- Check Firestore connection (browser console)

## 💡 Pro Tips

1. **Keep admin panel on separate device** (laptop/tablet) from leaderboard display
2. **Export after EVERY round** (CSV for quick check, JSON for archive)
3. **Screenshot final standings** before resetting (double backup)
4. **Test export feature** before tournament day
5. **Test override feature** before tournament day
6. **Have backup admin account** (same UID in multiple Auth accounts)
7. **Lock immediately** when match ends (coordinators WILL fat-finger after match)
8. **Name your exports** by round number (rename downloaded files: "Round1.csv", "Round2.csv")

---**Lock immediately** when match ends (coordinators WILL fat-finger after match)

---

## 🔗 Quick Links

From admin panel:
- **View Public Leaderboard** → Opens in new tab
- **Logout** → Back to login screen

---

**Built to prevent chaos. Use it.**
