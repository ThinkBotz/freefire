import { db } from './firebase-config.js';
import { collection, doc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const leaderboardDiv = document.getElementById('leaderboard');
const lastUpdateSpan = document.getElementById('lastUpdate');
const teamCountsSpan = document.getElementById('teamCounts');
const leaderboardTitleH1 = document.getElementById('leaderboardTitle');
const countdownTimerDiv = document.getElementById('countdownTimer');
const minutesSpan = document.getElementById('minutes');
const secondsSpan = document.getElementById('seconds');
const timerStatusDiv = document.getElementById('timerStatus');

let countdownInterval = null;
let targetTime = null;

// Listen for timer settings from admin
onSnapshot(doc(db, 'admin', 'settings'), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Update leaderboard title
        if (data.leaderboardTitle) {
            leaderboardTitleH1.textContent = '🏆 ' + data.leaderboardTitle;
        } else {
            leaderboardTitleH1.textContent = '🏆 LIVE LEADERBOARD';
        }
        
        // Update countdown timer
        if (data.countdownEndTime) {
            startCountdown(data.countdownEndTime, data.timerLabel || 'Match Timer');
        } else {
            stopCountdown();
        }
    } else {
        leaderboardTitleH1.textContent = '🏆 LIVE LEADERBOARD';
        stopCountdown();
    }
}, (error) => {
    console.warn('Could not load settings:', error);
    leaderboardTitleH1.textContent = '🏆 LIVE LEADERBOARD';
});

// Countdown timer functions
function startCountdown(endTime, label = 'Match Timer') {
    targetTime = endTime;
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = targetTime - now;
        
        if (timeLeft <= 0) {
            // Timer ended
            minutesSpan.textContent = '00';
            secondsSpan.textContent = '00';
            timerStatusDiv.textContent = 'Match Ended';
            countdownTimerDiv.classList.remove('urgent');
            countdownTimerDiv.classList.add('ended');
            clearInterval(countdownInterval);
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        minutesSpan.textContent = String(minutes).padStart(2, '0');
        secondsSpan.textContent = String(seconds).padStart(2, '0');
        timerStatusDiv.textContent = label;
        
        // Add urgent class when less than 2 minutes
        if (timeLeft <= 120000) {
            countdownTimerDiv.classList.add('urgent');
            countdownTimerDiv.classList.remove('ended');
        } else {
            countdownTimerDiv.classList.remove('urgent', 'ended');
        }
    }, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    minutesSpan.textContent = '00';
    secondsSpan.textContent = '00';
    timerStatusDiv.textContent = 'Timer not set';
    countdownTimerDiv.classList.remove('urgent', 'ended');
}

// Listen for leaderboard title changes (legacy support - merged into settings listener above)

// Real-time leaderboard
const q = query(collection(db, 'teams'), orderBy('score', 'desc'));

onSnapshot(q, (snapshot) => {
    const teams = [];
    let totalTeams = snapshot.size;
    let activeTeams = 0;
    
    snapshot.forEach((doc) => {
        const teamData = doc.data();
        // Only show active teams (default to true for backward compatibility)
        if (teamData.isActive !== false) {
            activeTeams += 1;
            teams.push({
                id: doc.id,
                ...teamData
            });
        }
    });
    
    renderLeaderboard(teams);
    updateTimestamp();
    updateTeamCounts(activeTeams, totalTeams);
}, (error) => {
    console.error('Leaderboard error:', error);
    leaderboardDiv.innerHTML = '<div class="loading">Error loading leaderboard. Please refresh.</div>';
});

// Render leaderboard
function renderLeaderboard(teams) {
    if (teams.length === 0) {
        leaderboardDiv.innerHTML = '<div class="loading">No teams yet...</div>';
        return;
    }
    
    leaderboardDiv.innerHTML = teams.map((team, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        
        return `
            <div class="team-row ${rankClass}">
                <div class="rank">#${rank}</div>
                <div class="team-name">${team.name || team.id}</div>
                <div class="kills">${team.kills || 0} K</div>
                <div class="placement">P${team.placement || '-'}</div>
                <div class="score">${team.score || 0} pts</div>
            </div>
        `;
    }).join('');
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdateSpan.textContent = time;
}

// Update active/total team counts
function updateTeamCounts(active, total) {
    if (!teamCountsSpan) return;
    teamCountsSpan.textContent = `Active teams: ${active}/${total}`;
}
