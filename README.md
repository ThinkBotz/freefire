# 🔥 Free Fire Event Management System

Professional esports event management platform with real-time leaderboards, coordinator dashboards, screenshot uploads, and admin controls.

---

## 📁 Project Structure

```
free_fire event/
├── index.html              # Login page
├── coordinator.html        # Coordinator update panel
├── leaderboard.html        # Live public leaderboard
├── admin.html              # Admin control panel (NEW)
├── css/
│   └── styles.css         # Dark esports theme
├── js/
│   ├── firebase-config.js # Firebase credentials
│   ├── login.js           # Authentication logic
│   ├── coordinator.js     # Score update logic
│   ├── leaderboard.js     # Real-time display
│   └── admin.js           # Admin controls (NEW)
├── firebase.json          # Hosting config
├── firestore.rules        # Security rules
├── README.md              # This file
├── SETUP.md               # Critical setup steps
└── ADMIN_GUIDE.md         # Admin panel documentation (NEW)
```

---

## 🚀 Setup Instructions

### 1️⃣ Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project**
3. Name it (e.g., "FreeFire Tournament")
4. Disable Google Analytics
5. Create project

### 2️⃣ Enable Authentication

1. **Authentication** → **Get Started**
2. **Sign-in method** → Enable **Email/Password**
3. Create 17 coordinator accounts:
   - `team1@yourtournament.com`
   - `team2@yourtournament.com`
   - ... (up to `team17@yourtournament.com`)
   - Use strong passwords, store them securely

### 3️⃣ Create Firestore Database

1. **Firestore Database** → **Create Database**
2. Choose **Production mode**
3. Select region closest to you

### 4️⃣ Initialize Team Documents

In Firestore Console, create collection `teams` with 17 documents:

**Document ID:** `team01`
```json
{
  "name": "Team Alpha",
  "kills": 0,
  "placement": 1,
  "score": 0,
  "coordinatorUID": "<copy UID from Authentication tab for team1@...>"
}
```

Repeat for `team02` through `team17`. 

**CRITICAL:** Match `coordinatorUID` with the actual Firebase Auth UID for each account.

### 5️⃣ Deploy Security Rules

1. Copy content from `firestore.rules`
2. Paste into **Firestore Database** → **Rules**
3. Publish rules

### 6️⃣ Get Firebase Config

1. **Project Settings** (gear icon)
2. Scroll to **Your apps** → **Web app** → Add app
3. Register app, copy the `firebaseConfig` object
4. Paste into `js/firebase-config.js` (replace placeholder values)

### 7️⃣ Deploy to Firebase Hosting

```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Hosting
# - Use existing project
# - Keep default settings

# Deploy
firebase deploy
```

Your live URL: `https://your-project-id.web.app`

---

## 🎯 Usage Flow

### Coordinators

1. Login at `index.html` with assigned credentials
2. See current team score
3. Update kills + placement
4. Submit (auto-calculates score)
5. View live leaderboard

### Public/Audience

1. Direct link to `leaderboard.html`
2. Auto-refreshes every time a coordinator updates
3. No login required

---

## 🛡️ Security Model

- **Read:** Anyone can view leaderboard
- **Write:** Only assigned coordinator can update their team
- **Admin:** (Optional) Lock matches, reset scores

---

## ⚙️ Scoring Formula (Current)

```
score = (kills × 1) + placementPoints

Placement Points (BGMI standard):
1st:  12 pts
2nd:  9 pts
3rd:  8 pts
4th:  7 pts
5th:  6 pts
6th:  5 pts
7th:  4 pts
8th:  3 pts
9th:  2 pts
10th: 1 pt
11+:  0 pts
```

Modify in `js/coordinator.js` → `placementPoints` object.

---

## 🔧 Customization

### Change Team Names
Edit Firestore documents → `name` field

### Adjust Scoring
Edit `js/coordinator.js` → `placementPoints` and kill multiplier

### UI Theme
Modify `css/styles.css` → gradient colors, fonts

---

## 🚨 Production Checklist

- [ ] All 17 teams created in Firestore
- [ ] `coordinatorUID` matches Auth UID exactly
- [ ] Security rules deployed
- [ ] Test login for each coordinator
- [ ] Test score update + leaderboard refresh
- [ ] Share leaderboard URL publicly
- [ ] Keep coordinator credentials private

---

## 📱 Mobile Friendly

Built mobile-first. Coordinators can update from phones. Tested on:
- Chrome/Safari mobile
- Portrait orientation optimized

---

## 🐛 Troubleshooting

**Login fails:**
- Check email/password in Firebase Auth
- Verify `firebaseConfig` in `firebase-config.js`

**Can't update score:**
- Verify `coordinatorUID` in Firestore matches logged-in user
- Check Firestore Rules are published

**Leaderboard not updating:**
- Check browser console for errors
- Verify Firestore read permissions (should be `allow read: if true`)

---

## 📊 Next Steps (Optional Enhancements)

1. **Admin Panel:** Lock matches, reset scores
2. **Multi-round support:** Track scores across rounds
3. **Export to PDF:** Final standings download
4. **Live commentary:** Add notes/highlights
5. **Kill feed:** Real-time kill notifications

---

**Built with:** Firebase, Vanilla JS, Corporate discipline

No frameworks. No bloat. Just works.
