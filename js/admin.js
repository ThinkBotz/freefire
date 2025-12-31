import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Admin UID - REPLACE THIS with your actual admin Firebase Auth UID
const ADMIN_UID = '2v67e9XQFpYqxzNf0D8g86iDxs33';

let isMatchLocked = false;
let teams = [];

// BGMI Placement Points
const placementPoints = {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1,
    9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0
};

// Auth check
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is admin
    if (user.uid !== ADMIN_UID) {
        alert('Access Denied: Admin privileges required');
        await signOut(auth);
        window.location.href = 'index.html';
        return;
    }
    
    initAdmin();
});

// Initialize admin panel
async function initAdmin() {
    loadMatchLockStatus();
    loadLeaderboardTitle();
    loadTeams();
    loadMatchHistory();
    loadCurrentScreenshots();
    setupEventListeners();
}

// Load match lock status
async function loadMatchLockStatus() {
    try {
        const lockDoc = await getDoc(doc(db, 'admin', 'matchLock'));
        
        if (lockDoc.exists()) {
            isMatchLocked = lockDoc.data().locked || false;
        } else {
            // Create if doesn't exist
            await updateDoc(doc(db, 'admin', 'matchLock'), { locked: false });
            isMatchLocked = false;
        }
        
        updateLockUI();
    } catch (error) {
        console.error('Error loading lock status:', error);
    }
}

// Load leaderboard title
async function loadLeaderboardTitle() {
    try {
        const titleDoc = await getDoc(doc(db, 'admin', 'settings'));
        const titleInput = document.getElementById('leaderboardTitleInput');
        
        if (titleDoc.exists() && titleDoc.data().leaderboardTitle) {
            titleInput.value = titleDoc.data().leaderboardTitle;
        }
    } catch (error) {
        console.error('Error loading leaderboard title:', error);
    }
}

// Update lock UI
function updateLockUI() {
    const statusEl = document.getElementById('lockStatus');
    const iconEl = document.getElementById('lockIcon');
    const btnEl = document.getElementById('toggleLockBtn');
    
    if (isMatchLocked) {
        statusEl.textContent = 'Match is LOCKED';
        statusEl.style.color = '#ff6b6b';
        iconEl.textContent = '🔒';
        btnEl.textContent = 'Unlock Match';
        btnEl.classList.remove('btn-primary');
        btnEl.classList.add('btn-success');
    } else {
        statusEl.textContent = 'Match is UNLOCKED';
        statusEl.style.color = '#4ecca3';
        iconEl.textContent = '🔓';
        btnEl.textContent = 'Lock Match';
        btnEl.classList.remove('btn-success');
        btnEl.classList.add('btn-primary');
    }
}

// Toggle match lock
async function toggleMatchLock() {
    try {
        const newStatus = !isMatchLocked;
        
        await updateDoc(doc(db, 'admin', 'matchLock'), {
            locked: newStatus,
            lastModified: new Date().toISOString()
        });
        
        isMatchLocked = newStatus;
        updateLockUI();
        
        showMessage(
            `Match ${newStatus ? 'LOCKED' : 'UNLOCKED'}. Coordinators ${newStatus ? 'cannot' : 'can'} update scores.`,
            'success'
        );
    } catch (error) {
        console.error('Error toggling lock:', error);
        showMessage('Failed to toggle lock. Check console.', 'error');
    }
}

// Load teams
function loadTeams() {
    const q = query(collection(db, 'teams'), orderBy('score', 'desc'));
    
    onSnapshot(q, (snapshot) => {
        teams = [];
        
        snapshot.forEach((doc) => {
            teams.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderTeamList();
        updateStats();
        populateTeamSelect();
        updateTeamCheckboxes();
        loadCurrentScreenshots(); // Update screenshots when teams change
    });
}

// Render team list
function renderTeamList() {
    const container = document.getElementById('teamList');
    
    if (teams.length === 0) {
        container.innerHTML = '<div class="loading">No teams found</div>';
        return;
    }
    
    container.innerHTML = teams.map((team, index) => `
        <div class="admin-team-row">
            <div class="team-rank">#${index + 1}</div>
            <div class="team-info">
                <div class="team-name-admin">${team.name || team.id}</div>
                <div class="team-details">
                    K: ${team.kills || 0} | P: ${team.placement || '-'} | Score: ${team.score || 0}
                </div>
            </div>
        </div>
    `).join('');
}

// Update stats
function updateStats() {
    document.getElementById('totalTeams').textContent = teams.length;
    const activeTeamsCount = teams.filter(team => team.isActive !== false).length;
    const activeTeamsEl = document.getElementById('activeTeams');
    if (activeTeamsEl) {
        activeTeamsEl.textContent = activeTeamsCount;
    }
    
    const totalKills = teams.reduce((sum, team) => sum + (team.kills || 0), 0);
    document.getElementById('totalKills').textContent = totalKills;
    
    const highest = teams.length > 0 ? teams[0].score || 0 : 0;
    document.getElementById('highestScore').textContent = highest;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    document.getElementById('lastUpdateTime').textContent = time;
}

// Populate team select
function populateTeamSelect() {
    const select = document.getElementById('teamSelect');
    
    select.innerHTML = '<option value="">Select Team...</option>' + 
        teams.map(team => 
            `<option value="${team.id}">${team.name || team.id}</option>`
        ).join('');
}




// Reset all scores
async function resetAllScores() {
    const confirm = window.confirm(
        '⚠️ WARNING: This will reset ALL team scores to ZERO.\n\n' +
        'This action CANNOT be undone.\n\n' +
        'Type "RESET" in the next prompt to confirm.'
    );
    
    if (!confirm) return;
    
    const doubleConfirm = window.prompt('Type RESET to confirm:');
    
    if (doubleConfirm !== 'RESET') {
        showMessage('Reset cancelled.', 'error');
        return;
    }
    
    try {
        const batch = writeBatch(db);
        
        teams.forEach(team => {
            const teamRef = doc(db, 'teams', team.id);
            batch.update(teamRef, {
                kills: 0,
                placement: 0,
                score: 0
            });
        });
        
        await batch.commit();
        
        showMessage('✅ All scores reset to zero.', 'success');
    } catch (error) {
        console.error('Error resetting scores:', error);
        showMessage('Failed to reset scores. Check console.', 'error');
    }
}

// Override team score
async function overrideTeamScore() {
    const teamId = document.getElementById('teamSelect').value;
    const kills = parseInt(document.getElementById('overrideKills').value) || 0;
    const placement = parseInt(document.getElementById('overridePlacement').value) || 1;
    
    if (!teamId) {
        showMessage('Select a team first.', 'error');
        return;
    }
    
    if (placement < 1 || placement > 17) {
        showMessage('Placement must be 1-17.', 'error');
        return;
    }
    
    const score = (kills * 1) + (placementPoints[placement] || 0);
    
    const confirm = window.confirm(
        `Override ${teamId}?\n\n` +
        `Kills: ${kills}\n` +
        `Placement: ${placement}\n` +
        `Total Score: ${score}`
    );
    
    if (!confirm) return;
    
    try {
        await updateDoc(doc(db, 'teams', teamId), {
            kills,
            placement,
            score
        });
        
        showMessage(`✅ ${teamId} score overridden.`, 'success');
        
        // Clear form
        document.getElementById('teamSelect').value = '';
        document.getElementById('overrideKills').value = '';
        document.getElementById('overridePlacement').value = '';
    } catch (error) {
        console.error('Error overriding score:', error);
        showMessage('Failed to override. Check console.', 'error');
    }
}

// Update leaderboard title
async function updateLeaderboardTitle() {
    const newTitle = (document.getElementById('leaderboardTitleInput').value || '').trim();

    if (!newTitle) {
        showMessage('Enter a title for the leaderboard.', 'error');
        return;
    }

    try {
        await setDoc(doc(db, 'admin', 'settings'), { leaderboardTitle: newTitle }, { merge: true });
        showMessage('✅ Leaderboard title updated!', 'success');
    } catch (error) {
        console.error('Error updating leaderboard title:', error);
        showMessage('Failed to update title.', 'error');
    }
}



// Show message
function showMessage(text, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = text;
    msgDiv.className = `message ${type}`;
    
    setTimeout(() => {
        msgDiv.classList.add('hide');
        setTimeout(() => {
            msgDiv.textContent = '';
            msgDiv.className = 'message';
        }, 500);
    }, 4000);
}

// Export to CSV
function exportToCSV() {
    console.log('Export CSV clicked, teams count:', teams.length);
    
    if (teams.length === 0) {
        showMessage('No teams to export', 'error');
        alert('No teams found. Please make sure teams are loaded.');
        return;
    }
    
    try {
        // Filter to only active teams (same as leaderboard)
        const activeTeams = teams.filter(team => team.isActive !== false);
        
        if (activeTeams.length === 0) {
            showMessage('No active teams to export', 'error');
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tournament_standings_${timestamp}.csv`;
        
        let csv = 'Rank,Team Name,Kills,Placement,Score\n';
        
        activeTeams.forEach((team, index) => {
            csv += `${index + 1},"${team.name || team.id}",${team.kills || 0},${team.placement || '-'},${team.score || 0}\n`;
        });
        
        console.log('CSV generated, length:', csv.length);
        downloadFile(csv, filename, 'text/csv');
        showMessage(`✅ CSV exported (${activeTeams.length} active teams)!`, 'success');
    } catch (error) {
        console.error('Export CSV error:', error);
        showMessage('Failed to export CSV: ' + error.message, 'error');
        alert('CSV Export failed: ' + error.message);
    }
}

// Export to JSON
function exportToJSON() {
    if (teams.length === 0) {
        showMessage('No teams to export', 'error');
        return;
    }
    
    try {
        // Filter to only active teams (same as leaderboard)
        const activeTeams = teams.filter(team => team.isActive !== false);
        
        if (activeTeams.length === 0) {
            showMessage('No active teams to export', 'error');
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tournament_data_${timestamp}.json`;
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            tournamentName: 'Free Fire Tournament',
            totalTeams: activeTeams.length,
            totalKills: activeTeams.reduce((sum, t) => sum + (t.kills || 0), 0),
            teams: activeTeams.map((team, index) => ({
                rank: index + 1,
                teamId: team.id,
                teamName: team.name || team.id,
                kills: team.kills || 0,
                placement: team.placement || 0,
                score: team.score || 0
            }))
        };
        
        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, filename, 'application/json');
        showMessage(`✅ JSON exported (${activeTeams.length} active teams)!`, 'success');
    } catch (error) {
        console.error('Export JSON error:', error);
        showMessage('Failed to export JSON', 'error');
    }
}

// Generate printable report
function exportToPrint() {
    if (teams.length === 0) {
        showMessage('No teams to print', 'error');
        return;
    }
    
    try {
        // Filter to only active teams (same as leaderboard)
        const activeTeams = teams.filter(team => team.isActive !== false);
        
        if (activeTeams.length === 0) {
            showMessage('No active teams to print', 'error');
            return;
        }
        
        const timestamp = new Date().toLocaleString();
        
        let printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showMessage('Please allow popups to print reports', 'error');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tournament Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        color: #333;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 15px;
                    }
                    .meta {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th {
                        background: #667eea;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    tr:nth-child(even) {
                        background: #f9f9f9;
                    }
                    tr:hover {
                        background: #f0f0f0;
                    }
                    .rank-1 { background: #ffd700 !important; font-weight: bold; }
                    .rank-2 { background: #c0c0c0 !important; font-weight: bold; }
                    .rank-3 { background: #cd7f32 !important; font-weight: bold; }
                    .stats {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin: 30px 0;
                    }
                    .stat-box {
                        text-align: center;
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 8px;
                    }
                    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 5px; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>🏆 Tournament Final Standings</h1>
                <div class="meta">
                    <p><strong>Generated:</strong> ${timestamp}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-label">Active Teams</div>
                        <div class="stat-value">${activeTeams.length}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Total Kills</div>
                        <div class="stat-value">${activeTeams.reduce((sum, t) => sum + (t.kills || 0), 0)}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Highest Score</div>
                        <div class="stat-value">${activeTeams.length > 0 ? activeTeams[0].score || 0 : 0}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team Name</th>
                            <th>Kills</th>
                            <th>Placement</th>
                            <th>Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTeams.map((team, index) => `
                            <tr class="${index < 3 ? 'rank-' + (index + 1) : ''}">
                                <td><strong>#${index + 1}</strong></td>
                                <td>${team.name || team.id}</td>
                                <td>${team.kills || 0}</td>
                                <td>${team.placement || '-'}</td>
                                <td><strong>${team.score || 0}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; text-align: center;">
                    <button onclick="window.print()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">🖨️ Print Report</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        showMessage(`✅ Print report opened (${activeTeams.length} active teams)`, 'success');
    } catch (error) {
        console.error('Export print error:', error);
        showMessage('Failed to open print window', 'error');
    }
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    try {
        console.log('Attempting download:', filename, 'Size:', content.length, 'bytes');
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('Download triggered successfully');
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed: ' + error.message);
    }
}

// Event listeners
function setupEventListeners() {
    document.getElementById('toggleLockBtn').addEventListener('click', toggleMatchLock);
    document.getElementById('resetAllBtn').addEventListener('click', resetAllScores);
    document.getElementById('overrideBtn').addEventListener('click', overrideTeamScore);
    document.getElementById('saveLeaderboardTitleBtn').addEventListener('click', updateLeaderboardTitle);
    
    // Export buttons
    document.getElementById('exportCSVBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportJSONBtn').addEventListener('click', exportToJSON);
    document.getElementById('exportPrintBtn').addEventListener('click', exportToPrint);
    
    // Round configuration
    document.getElementById('saveTeamsBtn').addEventListener('click', saveActiveTeams);
    
    // Timer controls
    document.querySelectorAll('.btn-timer').forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            startTimer(minutes);
        });
    });
    document.getElementById('startCustomTimer').addEventListener('click', startCustomTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    
    // End match
    document.getElementById('endMatchBtn').addEventListener('click', endMatch);
    
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
}

// Timer functions
async function startTimer(minutes, label = null) {
    try {
        const endTime = Date.now() + (minutes * 60 * 1000);
        const timerLabel = label || `${minutes} Min Match Timer`;
        
        await setDoc(doc(db, 'admin', 'settings'), {
            countdownEndTime: endTime,
            timerLabel: timerLabel,
            leaderboardTitle: document.getElementById('leaderboardTitleInput').value || 'LIVE LEADERBOARD'
        }, { merge: true });
        
        showMessage(`Timer started: ${minutes} minutes`, 'success');
    } catch (error) {
        console.error('Error starting timer:', error);
        showMessage('Failed to start timer', 'error');
    }
}

async function startCustomTimer() {
    const minutesInput = document.getElementById('customMinutes');
    const labelInput = document.getElementById('timerLabel');
    
    const minutes = parseInt(minutesInput.value);
    
    if (!minutes || minutes < 1) {
        showMessage('Please enter valid minutes (1-120)', 'error');
        return;
    }
    
    if (minutes > 120) {
        showMessage('Maximum timer duration is 120 minutes', 'error');
        return;
    }
    
    const label = labelInput.value.trim() || `${minutes} Min Match Timer`;
    
    await startTimer(minutes, label);
    
    minutesInput.value = '';
    labelInput.value = '';
}

async function stopTimer() {
    try {
        await setDoc(doc(db, 'admin', 'settings'), {
            countdownEndTime: null,
            timerLabel: null,
            leaderboardTitle: document.getElementById('leaderboardTitleInput').value || 'LIVE LEADERBOARD'
        }, { merge: true });
        
        showMessage('Timer stopped', 'success');
    } catch (error) {
        console.error('Error stopping timer:', error);
        showMessage('Failed to stop timer', 'error');
    }
}

// Set active team count
// Update team checkboxes - show all 20 teams
function updateTeamCheckboxes() {
    const container = document.getElementById('teamCheckboxes');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (teams.length === 0) {
        container.innerHTML = '<div class="loading">No teams found. Please refresh.</div>';
        return;
    }

    const sorted = [...teams].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

    sorted.forEach((team) => {
        const checkbox = document.createElement('label');
        checkbox.className = 'team-checkbox';
        const isActive = team.isActive !== false; // Default to true
        checkbox.innerHTML = `
            <input type="checkbox" value="${team.id}" ${isActive ? 'checked' : ''}>
            <span>${team.name || team.id}</span>
        `;
        container.appendChild(checkbox);
    });
}

// Save active teams selection
async function saveActiveTeams() {
    const checkboxes = document.querySelectorAll('#teamCheckboxes input[type="checkbox"]:checked');
    const activeTeamIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (activeTeamIds.length === 0) {
        showMessage('Please select at least one team', 'error');
        return;
    }
    
    try {
        // Update each team's active status
        const batch = writeBatch(db);
        
        teams.forEach(team => {
            const teamRef = doc(db, 'teams', team.id);
            batch.update(teamRef, {
                isActive: activeTeamIds.includes(team.id)
            });
        });
        
        await batch.commit();
        
        showMessage(`✅ ${activeTeamIds.length} team(s) activated for this round`, 'success');
    } catch (error) {
        console.error('Error saving active teams:', error);
        showMessage('Failed to save active teams', 'error');
    }
}

// End match and generate final report
async function endMatch() {
    const confirm = window.confirm(
        '⚠️ WARNING: This will end the match and generate a final report.\\n\\n' +
        'Make sure all team scores are finalized.\\n\\n' +
        'Continue?'
    );
    
    if (!confirm) return;
    
    try {
        const finalReport = {
            generatedAt: new Date().toISOString(),
            matchData: {
                totalTeams: teams.length,
                activeTeams: teams.filter(t => t.isActive !== false).length,
                totalKills: teams.reduce((sum, t) => sum + (t.kills || 0), 0),
                highestScore: teams.length > 0 ? teams[0].score : 0
            },
            teams: teams.map((team, index) => {
                console.log('Team data:', team.id, 'Screenshot URL:', team.screenshotURL);
                return {
                    rank: index + 1,
                    teamId: team.id,
                    teamName: team.name || team.id,
                    kills: team.kills || 0,
                    placement: team.placement || 0,
                    score: team.score || 0,
                    isActive: team.isActive !== false,
                    members: team.members || {},
                    screenshotURL: team.screenshotURL || null,
                    screenshotTimestamp: team.screenshotTimestamp || null
                };
            })
        };
        
        // Save match data to Firestore (use admin collection to bypass permission issues)
        const reportId = `report_${Date.now()}`;
        const leaderboardTitle = document.getElementById('leaderboardTitleInput').value || 'LIVE LEADERBOARD';
        const reportData = {
            generatedAt: finalReport.generatedAt,
            matchData: finalReport.matchData,
            teams: finalReport.teams,
            leaderboardTitle: leaderboardTitle
        };
        
        // Add to match reports array
        const adminDocRef = doc(db, 'admin', 'matchReports');
        const adminDoc = await getDoc(adminDocRef);
        
        if (adminDoc.exists()) {
            const reports = adminDoc.data().reports || [];
            reports.push(reportData);
            await setDoc(adminDocRef, { reports });
        } else {
            await setDoc(adminDocRef, { reports: [reportData] });
        }
        
        // Generate CSV download
        generateMatchReport(finalReport);
        
        // Reload match history
        loadMatchHistory();
        
        showMessage('✅ Match ended! Report generated, saved, and backed up.', 'success');
    } catch (error) {
        console.error('Error ending match:', error);
        showMessage('Failed to end match: ' + error.message, 'error');
    }
}

// Generate match report download
function generateMatchReport(reportData) {
    // CSV Format
    let csv = 'MATCH FINAL REPORT\n';
    csv += `Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;
    csv += 'MATCH STATISTICS\n';
    csv += `Total Teams,Active Teams,Total Kills,Highest Score\n`;
    csv += `${reportData.matchData.totalTeams},${reportData.matchData.activeTeams},${reportData.matchData.totalKills},${reportData.matchData.highestScore}\n\n`;
    csv += 'TEAM STANDINGS\n';
    csv += 'Rank,Team Name,Kills,Placement,Score,Active,Player1,Player2,Player3,Player4\n';
    
    reportData.teams.forEach(team => {
        const members = team.members || {};
        const playerNames = [];
        for (let i = 1; i <= 4; i++) {
            playerNames.push(members[`player${i}`]?.username || '');
        }
        csv += `${team.rank},"${team.teamName}",${team.kills},${team.placement},${team.score},${team.isActive ? 'Yes' : 'No'},"${playerNames.join('","')}"\n`;
    });
    
    // Download CSV
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `leaderboard_${Date.now()}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
}

// Load and display match history
async function loadMatchHistory() {
    try {
        const adminDocRef = doc(db, 'admin', 'matchReports');
        const adminDoc = await getDoc(adminDocRef);
        
        if (!adminDoc.exists()) {
            document.getElementById('matchHistoryList').innerHTML = '<p style="color: #888;">No match reports yet</p>';
            return;
        }
        
        const matchReports = adminDoc.data().reports || [];
        
        if (matchReports.length === 0) {
            document.getElementById('matchHistoryList').innerHTML = '<p style="color: #888;">No match reports yet</p>';
            return;
        }
        
        // Sort by date descending (newest first)
        const sorted = [...matchReports].sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
        
        const historyHTML = sorted.map((report, index) => {
            const date = new Date(report.generatedAt);
            const formattedDate = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const reportIndex = sorted.length - index;
            const reportId = `report_${reportIndex}_${date.getTime()}`;
            
            // Count teams with screenshots
            const screenshotCount = report.teams.filter(t => t.screenshotURL).length;
            
            return `
                <div style="background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h4 style="color: #00d9ff; margin: 0 0 8px 0;">📊 ${report.leaderboardTitle || 'Match Report'} #${reportIndex}</h4>
                            <p style="margin: 0; color: #aaa; font-size: 14px;">
                                📅 ${formattedDate} | 
                                🎮 ${report.matchData.activeTeams}/${report.matchData.totalTeams} Teams | 
                                🎯 Kills: ${report.matchData.totalKills} | 
                                ⭐ High Score: ${report.matchData.highestScore}
                                ${screenshotCount > 0 ? ` | 📸 ${screenshotCount} Screenshots` : ''}
                            </p>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${screenshotCount > 0 ? `
                                <button class="btn-secondary view-screenshots" data-report-index="${index}" style="padding: 8px 15px; font-size: 14px;">
                                    📸 View Screenshots
                                </button>
                            ` : ''}
                            <button class="btn-export match-report-download" data-report-id="${reportId}" data-leaderboard-title="${(report.leaderboardTitle || 'leaderboard').replace(/"/g, '\\"')}" style="padding: 8px 15px; font-size: 14px;">
                                📥 Download
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('matchHistoryList').innerHTML = historyHTML;
        
        // Attach event listeners to all download buttons
        document.querySelectorAll('.match-report-download').forEach(btn => {
            btn.addEventListener('click', function() {
                const reportId = this.getAttribute('data-report-id');
                const title = this.getAttribute('data-leaderboard-title');
                const reportIndex = parseInt(reportId.split('_')[1]);
                const report = sorted[sorted.length - reportIndex];
                downloadMatchReportCSV(report, title);
            });
        });
        
        // Attach event listeners to screenshot view buttons
        document.querySelectorAll('.view-screenshots').forEach(btn => {
            btn.addEventListener('click', function() {
                const reportIndex = parseInt(this.getAttribute('data-report-index'));
                const report = sorted[reportIndex];
                window.showScreenshotsModal(report);
            });
        });
    } catch (error) {
        console.error('Error loading match history:', error);
        document.getElementById('matchHistoryList').innerHTML = '<p style="color: #ff6b6b;">Error loading match history</p>';
    }
}

// Load current team screenshots
function loadCurrentScreenshots() {
    const container = document.getElementById('currentScreenshots');
    
    console.log('Loading current screenshots. Total teams:', teams.length);
    
    if (!teams || teams.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No teams yet</p>';
        return;
    }
    
    // Load screenshots from subcollections
    loadTeamScreenshotsFromFirestore(container);
}

// Load screenshots from Firestore subcollections
async function loadTeamScreenshotsFromFirestore(container) {
    try {
        let allScreenshots = [];
        
        // Fetch screenshots for each team
        for (const team of teams) {
            try {
                const screenshotDocs = await getDocs(collection(db, 'teams', team.id, 'screenshots'));
                screenshotDocs.forEach(doc => {
                    const data = doc.data();
                    allScreenshots.push({
                        teamId: team.id,
                        teamName: team.name || team.id,
                        teamRank: teams.findIndex(t => t.id === team.id) + 1,
                        teamScore: team.score || 0,
                        teamKills: team.kills || 0,
                        teamPlacement: team.placement || '-',
                        screenshotId: doc.id,
                        ...data
                    });
                });
            } catch (error) {
                // Team might not have screenshots collection yet, that's OK
                console.log('No screenshots for team:', team.id);
            }
        }
        
        console.log('Total screenshots loaded:', allScreenshots.length);
        
        if (allScreenshots.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No screenshots uploaded yet</p>';
            return;
        }
        
        // Sort by upload time (newest first)
        allScreenshots.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        const screenshotsHTML = allScreenshots.map((screenshot) => {
            const uploadTime = new Date(screenshot.uploadedAt).toLocaleString();
            
            return `
                <div class="screenshot-card">
                    <div class="screenshot-card-header">
                        <div>
                            <h4 style="color: #00d9ff; margin: 0 0 5px 0;">Rank #${screenshot.teamRank}: ${screenshot.teamName}</h4>
                            <p style="margin: 0; color: #aaa; font-size: 13px;">
                                Score: ${screenshot.teamScore} | Kills: ${screenshot.teamKills} | Placement: ${screenshot.teamPlacement}
                            </p>
                            <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">📅 ${uploadTime}</p>
                        </div>
                    </div>
                    <div class="screenshot-card-image">
                        <img src="${screenshot.data}" alt="${screenshot.teamName} screenshot" loading="lazy">
                    </div>
                    <div class="screenshot-card-actions">
                        <a href="${screenshot.data}" target="_blank" class="btn-secondary" style="text-decoration: none; display: inline-block; padding: 8px 15px; font-size: 13px; text-align: center; flex: 1;">
                            🔗 View Full Size
                        </a>
                        <button class="btn-secondary" style="padding: 8px 15px; font-size: 13px; cursor: pointer; flex: 1;" onclick="downloadBase64('${screenshot.data}', '${screenshot.teamName}_screenshot.jpg')">
                            📥 Download
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div style="margin-bottom: 15px; color: #00d9ff; font-size: 14px;">
                📸 ${allScreenshots.length} screenshot${allScreenshots.length !== 1 ? 's' : ''} uploaded
            </div>
            <div class="screenshot-grid-live">
                ${screenshotsHTML}
            </div>
        `;
    } catch (error) {
        console.error('Error loading screenshots from Firestore:', error);
        container.innerHTML = '<p style="color: #ff6b6b;">Error loading screenshots</p>';
    }
}

// Download base64 image
window.downloadBase64 = function(base64String, filename) {
    const link = document.createElement('a');
    link.href = base64String;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Download individual match report as CSV
function downloadMatchReportCSV(report, title) {
    let csv = 'MATCH FINAL REPORT\n';
    csv += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
    csv += 'MATCH STATISTICS\n';
    csv += `Total Teams,Active Teams,Total Kills,Highest Score\n`;
    csv += `${report.matchData.totalTeams},${report.matchData.activeTeams},${report.matchData.totalKills},${report.matchData.highestScore}\n\n`;
    csv += 'TEAM STANDINGS\n';
    csv += 'Rank,Team Name,Kills,Placement,Score,Active\n';
    
    report.teams.forEach(team => {
        csv += `${team.rank},"${team.teamName}",${team.kills},${team.placement},${team.score},${team.isActive ? 'Yes' : 'No'}\n`;
    });
    
    // Download CSV with leaderboard title as filename
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    const filename = (title || 'leaderboard').replace(/[^a-zA-Z0-9]/g, '_');
    csvLink.download = `${filename}_${new Date(report.generatedAt).getTime()}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
}

// Show screenshots modal
window.showScreenshotsModal = function(report) {
    const modal = document.getElementById('screenshotModal');
    const grid = document.getElementById('screenshotGrid');
    
    const teamsWithScreenshots = report.teams.filter(t => t.screenshotURL);
    
    if (teamsWithScreenshots.length === 0) {
        grid.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No screenshots uploaded for this match</p>';
    } else {
        const screenshotsHTML = teamsWithScreenshots.map(team => {
            const uploadTime = team.screenshotTimestamp 
                ? new Date(team.screenshotTimestamp).toLocaleString() 
                : 'Unknown';
            
            return `
                <div class="screenshot-item">
                    <div class="screenshot-header">
                        <h4>Rank #${team.rank}: ${team.teamName}</h4>
                        <p>Score: ${team.score} | Kills: ${team.kills} | Placement: ${team.placement}</p>
                        <p style="font-size: 12px; color: #888;">Uploaded: ${uploadTime}</p>
                    </div>
                    <div class="screenshot-image">
                        <img src="${team.screenshotURL}" alt="${team.teamName} screenshot" onclick="window.open('${team.screenshotURL}', '_blank')">
                    </div>
                    <div class="screenshot-actions">
                        <a href="${team.screenshotURL}" target="_blank" class="btn-secondary" style="text-decoration: none; display: inline-block; padding: 8px 15px; font-size: 14px;">
                            🔗 Open Full Size
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = screenshotsHTML;
    }
    
    modal.style.display = 'flex';
};

// Close screenshots modal
window.closeScreenshotModal = function() {
    document.getElementById('screenshotModal').style.display = 'none';
};

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('screenshotModal');
    if (e.target === modal) {
        closeScreenshotModal();
    }
});


