## Team Name Update - Action Required

### What Changed:
- All team names updated from "Team Alpha, Team Bravo..." to "Team1, Team2..." format
- Firestore import template updated with new names
- Admin panel code updated to work with new naming

### How to Update Your Database:

1. **Login to admin panel** with samxiao@admin.com
2. **Open this link in a new tab**: `update-team-names.html`
3. **Click "🚀 Start Update"** button
4. Wait for completion (should see ✅ success message)
5. Refresh the page to see changes

### New Team Names:
- Team1, Team2, Team3, ... Team20

### Old Team Names (being replaced):
- Team Alpha → Team1
- Team Bravo → Team2
- Team Charlie → Team3
- Team Delta → Team4
- Team Echo → Team5
- Team Foxtrot → Team6
- Team Golf → Team7
- Team Hotel → Team8
- Team India → Team9
- Team Juliett → Team10
- Team Kilo → Team11
- Team Lima → Team12
- Team Mike → Team13
- Team November → Team14
- Team Oscar → Team15
- Team Papa → Team16
- Team Quebec → Team17
- Team Romeo → Team18
- Team Sierra → Team19
- Team Tango → Team20

### Files Updated:
✅ firestore-import.json (template)
✅ js/admin.js (team checkbox logic)
✅ Created update-team-names.html (batch updater tool)

### Deploy Updated Rules:
After updating names, deploy the updated rules:
```
firebase deploy --only firestore:rules
```

Done! 🎉
