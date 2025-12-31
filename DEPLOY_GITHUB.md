# 🚀 GitHub Deployment Guide

Push your Free Fire Event Management System to GitHub and deploy to Firebase Hosting.

## Step 1: Initialize Git (if not already done)

```bash
cd "free_fire event"
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

## Step 2: Add All Files to Git

```bash
git add .
git commit -m "Initial commit: Free Fire Event Management System with screenshot upload, admin controls, and real-time leaderboard"
```

## Step 3: Connect to GitHub Repository

```bash
git remote add origin https://github.com/ThinkBotz/freefire.git
git branch -M main
git push -u origin main
```

## Step 4: Verify on GitHub

1. Go to https://github.com/ThinkBotz/freefire
2. Confirm all files are uploaded
3. Check that `.gitignore` is hiding sensitive files

## Step 5: Deploy to Firebase Hosting

### Option A: Firebase CLI (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init hosting

# When prompted:
# - Select project: freefire-thinkbotz
# - Public directory: . (current folder)
# - Single page app: No
# - Overwrite index.html: No

# Deploy
firebase deploy --only hosting
```

### Option B: Manual Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project: `freefire-thinkbotz`
3. Go to **Hosting**
4. Follow deployment steps

## Step 6: Your Live URLs

After deployment, your app is available at:

- **Leaderboard**: `https://freefire-thinkbotz.web.app/leaderboard.html`
- **Coordinator**: `https://freefire-thinkbotz.web.app/coordinator.html`
- **Admin**: `https://freefire-thinkbotz.web.app/admin.html`
- **Login**: `https://freefire-thinkbotz.web.app/index.html`

## Updating Code

To push updates:

```bash
# Make your changes locally
git add .
git commit -m "Describe your changes"
git push origin main

# Deploy to Firebase
firebase deploy --only hosting
```

## Troubleshooting

**Issue**: Files not showing up on GitHub
```bash
# Make sure .gitignore is not excluding them
git check-ignore -v <filename>
```

**Issue**: Firebase deploy fails
```bash
# Check you're logged in
firebase login
firebase projects:list

# Redeploy
firebase deploy --only hosting
```

**Issue**: Need to view deployment logs
```bash
firebase hosting:channel:list
firebase hosting:channel:open <CHANNEL_ID>
```

## Security Checklist Before Going Live

- [ ] Update admin UID in `js/admin.js` line 6
- [ ] Add your Firebase credentials to `js/firebase-config.js`
- [ ] Set strong passwords for coordinator accounts
- [ ] Configure Firestore security rules
- [ ] Enable HTTPS (automatic with Firebase)
- [ ] Test all features (upload, submit, timer, notifications)
- [ ] Verify Firebase Firestore rules are published

## GitHub Repository Settings

Go to https://github.com/ThinkBotz/freefire/settings and:

1. **Visibility**: Set to Public (if you want)
2. **Branch protection**: Enable for `main` branch (optional)
3. **Actions**: Enable GitHub Actions (optional, for CI/CD)

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Firebase Hosting
3. 📱 Share live URLs with event organizers
4. 🧪 Test with coordinators
5. 🎮 Run your event!

---

**Need help?** Check the main README.md for feature documentation and Firebase setup instructions.
