# 🔐 Secure Login System - Username-Based Access

Your tournament now has **whitelisted username login**. Only authorized users can access.

---

## 🎯 How It Works

### **For Coordinators:**
- Login with **username only** (not full email)
- Example: Type `team1` instead of `team1@thinkbotz.com`
- System auto-converts to email behind the scenes
- **Only whitelisted usernames work**

### **For Admins:**
- Separate admin login tab
- Uses full email address
- Must contain `admin@` to be valid

---

## 👥 Allowed Coordinator Usernames

**Hardcoded in `js/login.js` (line 5-9):**

```js
const ALLOWED_COORDINATORS = [
    'team1', 'team2', 'team3', 'team4', 'team5',
    'team6', 'team7', 'team8', 'team9', 'team10',
    'team11', 'team12', 'team13', 'team14', 'team15',
    'team16', 'team17'
];
```

**What this means:**
- Only these 17 usernames can login as coordinators
- Anyone else gets: `❌ Invalid username. Not authorized.`
- No random person can guess and access

---

## 🛠️ Customizing Usernames

### Option 1: Keep team1-team17 (Simple)
No changes needed. Just use:
- `team1`, `team2`, etc.

### Option 2: Custom Names (Your Choice)

Open `js/login.js` and replace the array:

```js
const ALLOWED_COORDINATORS = [
    'phoenix', 'dragon', 'viper', 'thunder', 'titan',
    'falcon', 'eagle', 'hunter', 'warrior', 'knight',
    'shadow', 'blaze', 'storm', 'ice', 'fire',
    'lightning', 'cosmos'
];
```

Then create Firebase Auth accounts with matching emails:
- `phoenix@thinkbotz.com`
- `dragon@thinkbotz.com`
- etc.

### Option 3: Real Coordinator Names

```js
const ALLOWED_COORDINATORS = [
    'examcoordinator1', 'examcoordinator2', 'examcoordinator3',
    'coordinator_a', 'coordinator_b', 'coordinator_c',
    // ... add 17 total
];
```

---

## 📧 Email Domain

**Currently set to:** `@thinkbotz.com`

**To change:** Open `js/login.js`, line 13:

```js
const COORDINATOR_DOMAIN = '@thinkbotz.com';
```

Change to:
```js
const COORDINATOR_DOMAIN = '@yourschool.com';
// or
const COORDINATOR_DOMAIN = '@yourtournament.org';
```

**Important:** Firebase Auth emails must match this domain.

---

## 🔐 Security Features

✅ **Whitelist enforcement** - Only listed usernames allowed  
✅ **Client-side check** - Fast rejection of unauthorized users  
✅ **Server-side check** - Firebase Auth validates credentials  
✅ **Separate admin login** - Admins can't accidentally login as coordinator  
✅ **Auto-redirect** - Admins go to admin panel, coordinators to their panel  

---

## 🎮 User Experience

### Coordinator Login:
1. Click "Coordinator" tab (default)
2. Enter username: `team1`
3. Enter password
4. Click "Login as Coordinator"
5. Redirects to coordinator panel for Team 1

### Admin Login:
1. Click "Admin" tab
2. Enter full email: `admin@thinkbotz.com`
3. Enter password
4. Click "Login as Admin"
5. Redirects to admin control panel

---

## 🔧 Firebase Auth Setup (Updated)

### Create Accounts with Matching Emails:

**Coordinator Accounts:**
```
Email: team1@thinkbotz.com    | Username: team1
Email: team2@thinkbotz.com    | Username: team2
...
Email: team17@thinkbotz.com   | Username: team17
```

**Admin Account:**
```
Email: admin@thinkbotz.com    | Full email required
```

### Steps:
1. Firebase Console → Authentication → Users
2. Add user: `team1@thinkbotz.com` + password
3. Repeat for all 17 teams
4. Add admin: `admin@thinkbotz.com` + password

---

## 📋 Coordinator Credential Format

**What you give to coordinators:**

```
Tournament Login Credentials
----------------------------
URL: https://your-app.web.app

Username: team1
Password: [their password]

Instructions:
1. Open the URL
2. Make sure "Coordinator" tab is selected
3. Enter your username (just "team1", not the full email)
4. Enter your password
5. Click "Login as Coordinator"
```

**No email needed.** Clean and simple.

---

## ⚠️ Important Notes

**1. Whitelist must match Firebase emails**
   - If whitelist has `team1`
   - Firebase must have `team1@thinkbotz.com`
   - Domain must match `COORDINATOR_DOMAIN`

**2. Case insensitive**
   - User types `TEAM1` → converted to `team1`
   - Username is auto-lowercased

**3. Admin vs Coordinator separation**
   - Admin login requires `admin@` in email
   - Coordinators can't access admin panel
   - Admin can't accidentally login as coordinator

**4. Error messages**
   - Invalid username: Not in whitelist
   - Wrong password: Bad credentials
   - Account not found: Email doesn't exist in Firebase

---

## 🐛 Troubleshooting

**"Invalid username. Not authorized."**
- Username not in `ALLOWED_COORDINATORS` array
- Check spelling in `login.js`

**"Account not found."**
- Firebase email doesn't exist
- Check domain matches `COORDINATOR_DOMAIN`
- Example: Whitelist has `team1`, domain is `@thinkbotz.com`
  → Firebase must have `team1@thinkbotz.com`

**"Admin credentials required."**
- Trying to use coordinator email in admin login
- Use coordinator tab for coordinators, admin tab for admins

---

## 🎯 What Changed

**Updated Files:**
- ✅ `index.html` - Role selector tabs, dual login forms
- ✅ `js/login.js` - Username whitelist, domain conversion, role routing
- ✅ `css/styles.css` - Tab styling, form switching

**How it works:**
1. User types username: `team1`
2. System checks whitelist: ✅ Allowed
3. Converts to email: `team1@thinkbotz.com`
4. Sends to Firebase Auth
5. Firebase validates credentials
6. User redirected to coordinator panel

---

**Your login is now locked down. Only whitelisted users get access.**
