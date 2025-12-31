import { auth, db, storage } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, getDocs, collection, updateDoc, onSnapshot, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

let currentTeamId = null;
let currentData = {};
let isMatchLocked = false;
let notificationPermission = 'default';
let lastTimerEndTime = null;
let screenshotFile = null;
let screenshotURL = null;

// BGMI/PUBG Placement Points (standard)
const placementPoints = {
    1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3,
    9: 2, 10: 1, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0
};

// Check and request notification permission
async function checkNotificationPermission() {
    if (!('Notification' in window)) {
        updateNotificationStatus('unsupported');
        return;
    }
    
    notificationPermission = Notification.permission;
    updateNotificationStatus(notificationPermission);
    
    if (notificationPermission === 'granted') {
        listenForTimerChanges();
    }
}

// Update notification status UI
function updateNotificationStatus(status) {
    const statusDiv = document.getElementById('notificationStatus');
    const iconSpan = document.getElementById('notificationIcon');
    const textSpan = document.getElementById('notificationText');
    const btn = document.getElementById('enableNotificationsBtn');
    
    if (!statusDiv) return;
    
    statusDiv.className = 'notification-status';
    
    switch(status) {
        case 'granted':
            statusDiv.classList.add('enabled');
            iconSpan.textContent = '✅';
            textSpan.textContent = 'Notifications enabled - You\'ll be notified about match updates';
            btn.textContent = 'Enabled';
            btn.disabled = true;
            break;
        case 'denied':
            statusDiv.classList.add('denied');
            iconSpan.textContent = '🔕';
            textSpan.textContent = 'Notifications blocked - Please enable in browser settings';
            btn.style.display = 'none';
            break;
        case 'unsupported':
            statusDiv.classList.add('denied');
            iconSpan.textContent = '❌';
            textSpan.textContent = 'Push notifications not supported on this browser';
            btn.style.display = 'none';
            break;
        default:
            iconSpan.textContent = '🔔';
            textSpan.textContent = 'Enable notifications for match updates';
            btn.textContent = 'Enable';
            btn.disabled = false;
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        updateNotificationStatus(permission);
        
        if (permission === 'granted') {
            showNotification('Notifications Enabled', {
                body: 'You will now receive match updates',
                icon: '🔔'
            });
            listenForTimerChanges();
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Show notification
function showNotification(title, options = {}) {
    if (notificationPermission !== 'granted') return;
    
    const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '🏆',
        badge: '🎮',
        vibrate: [200, 100, 200],
        requireInteraction: options.requireInteraction || false,
        ...options
    });
    
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}

// Listen for timer changes
function listenForTimerChanges() {
    onSnapshot(doc(db, 'admin', 'settings'), (docSnap) => {
        if (!docSnap.exists()) return;
        
        const data = docSnap.data();
        const currentEndTime = data.countdownEndTime;
        
        // Timer just started
        if (currentEndTime && currentEndTime !== lastTimerEndTime) {
            const timeLeft = currentEndTime - Date.now();
            const minutes = Math.floor(timeLeft / 60000);
            
            if (minutes > 0) {
                showNotification('⏱️ Match Timer Started', {
                    body: `Timer set for ${minutes} minutes`,
                    requireInteraction: true
                });
                
                // Set notification for when timer ends
                setTimeout(() => {
                    showNotification('🏁 Match Time Over!', {
                        body: 'The match timer has ended',
                        requireInteraction: true,
                        vibrate: [300, 100, 300, 100, 300]
                    });
                }, timeLeft);
            }
            
            lastTimerEndTime = currentEndTime;
        }
        
        // Timer stopped/cleared
        if (!currentEndTime && lastTimerEndTime) {
            showNotification('⏹️ Timer Stopped', {
                body: 'The match timer has been stopped by admin'
            });
            lastTimerEndTime = null;
        }
    });
}

// Auth check
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    await loadTeamData(user.uid);
    listenToMatchLock();
    checkNotificationPermission();
});

// Enable notifications button handler
document.addEventListener('DOMContentLoaded', () => {
    const enableBtn = document.getElementById('enableNotificationsBtn');
    if (enableBtn) {
        enableBtn.addEventListener('click', requestNotificationPermission);
    }
    
    setupScreenshotUpload();
});

// Screenshot upload functionality
function setupScreenshotUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const screenshotInput = document.getElementById('screenshotInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const removeBtn = document.getElementById('removeScreenshot');
    
    if (!uploadArea || !screenshotInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target.id !== 'removeScreenshot' && !e.target.closest('.btn-remove')) {
            screenshotInput.click();
        }
    });
    
    // File input change
    screenshotInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleScreenshotFile(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleScreenshotFile(file);
        }
    });
    
    // Remove screenshot
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        screenshotFile = null;
        screenshotURL = null;
        screenshotInput.value = '';
        uploadPlaceholder.style.display = 'flex';
        uploadPreview.style.display = 'none';
        previewImage.src = '';
    });
}

function handleScreenshotFile(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showMessage('Please upload an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showMessage('Image size must be less than 5MB', 'error');
        return;
    }
    
    screenshotFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('previewImage');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        
        previewImage.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function uploadScreenshot() {
    if (!screenshotFile || !currentTeamId) {
        console.log('Upload skipped - screenshotFile:', screenshotFile, 'currentTeamId:', currentTeamId);
        return null;
    }
    
    console.log('Starting screenshot upload for team:', currentTeamId);
    
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressDiv.style.display = 'block';
    progressText.textContent = 'Converting image...';
    
    try {
        // Convert image to base64
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const base64Data = reader.result;
                    console.log('Image converted to base64, size:', base64Data.length, 'bytes');
                    
                    progressText.textContent = 'Saving to database...';
                    
                    // Save to Firestore instead of Storage
                    const screenshotData = {
                        data: base64Data,
                        fileName: screenshotFile.name,
                        fileSize: screenshotFile.size,
                        mimeType: screenshotFile.type,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    // Save as a simple URL-like reference (we'll store the image data in team doc)
                    const timestamp = Date.now();
                    const screenshotId = `screenshot_${timestamp}`;
                    
                    console.log('Saving screenshot to Firestore with ID:', screenshotId);
                    
                    // Save screenshot data to a subcollection for better organization
                    await setDoc(doc(db, 'teams', currentTeamId, 'screenshots', screenshotId), screenshotData);
                    
                    console.log('Screenshot saved successfully to Firestore');
                    progressDiv.style.display = 'none';
                    progressFill.style.width = '0%';
                    
                    // Return a reference ID instead of a URL
                    resolve(screenshotId);
                } catch (error) {
                    console.error('Error saving screenshot:', error);
                    progressDiv.style.display = 'none';
                    alert('Failed to save screenshot: ' + error.message);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('File read error:', error);
                progressDiv.style.display = 'none';
                alert('Failed to read image file');
                reject(error);
            };
            
            // Read file as data URL (base64)
            reader.readAsDataURL(screenshotFile);
            progressText.textContent = 'Reading file...';
        });
    } catch (error) {
        progressDiv.style.display = 'none';
        throw error;
    }
}

// Listen for match lock status
function listenToMatchLock() {
    onSnapshot(doc(db, 'admin', 'matchLock'), (doc) => {
        if (doc.exists()) {
            isMatchLocked = doc.data().locked || false;
            updateLockUI();
        }
    });
}

// Update UI based on lock status
function updateLockUI() {
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    
    if (isMatchLocked) {
        submitBtn.disabled = true;
        messageDiv.textContent = '🔒 Match is locked. Updates disabled by admin.';
        messageDiv.className = 'message error';
    } else {
        calculatePreview(); // Re-enable if values changed
        if (messageDiv.textContent.includes('locked')) {
            messageDiv.textContent = '';
        }
    }
}

// Load team data
async function loadTeamData(uid) {
    try {
        // Query all teams to find the one matching this coordinator's UID
        const teamsRef = collection(db, 'teams');
        const teamsSnapshot = await getDocs(teamsRef);
        
        let foundTeam = null;
        teamsSnapshot.forEach((doc) => {
            if (doc.data().coordinatorUID === uid) {
                foundTeam = { id: doc.id, ...doc.data() };
            }
        });
        
        if (!foundTeam) {
            alert('Error: No team assigned to your account. Contact admin.');
            await signOut(auth);
            window.location.href = 'index.html';
            return;
        }
        
        currentTeamId = foundTeam.id;
        
        // Listen for real-time updates
        onSnapshot(doc(db, 'teams', currentTeamId), (doc) => {
            if (doc.exists()) {
                currentData = doc.data();
                updateUI(currentData);
            }
        });
    } catch (error) {
        console.error('Error loading team:', error);
        alert('Error loading team data. Check console.');
    }
}

// Update UI
function updateUI(data) {
    document.getElementById('teamName').textContent = data.name || 'Team';
    document.getElementById('currentScore').textContent = data.score || 0;
    document.getElementById('kills').value = data.kills || 0;
    document.getElementById('placement').value = (data.placement ?? '') === 0 ? '' : (data.placement || '');
    
    calculatePreview();
}

// Calculate score preview
function calculatePreview() {
    const kills = parseInt(document.getElementById('kills').value) || 0;
    const placement = parseInt(document.getElementById('placement').value) || 0;
    
    const killPts = kills * 1; // 1 point per kill (adjust as needed)
    const placePts = placementPoints[placement] || 0;
    const total = killPts + placePts;
    
    document.getElementById('killPoints').textContent = killPts;
    document.getElementById('placementPoints').textContent = placePts;
    document.getElementById('totalPreview').textContent = total;
    
    // Enable/disable submit button
    const changed = kills !== (currentData.kills || 0) || placement !== (currentData.placement || 0);
    document.getElementById('submitBtn').disabled = !changed;
}

// Input listeners
document.getElementById('kills').addEventListener('input', calculatePreview);
document.getElementById('placement').addEventListener('input', calculatePreview);

// Submit form
document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check if match is locked
    if (isMatchLocked) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = '🔒 Cannot update. Match is locked by admin.';
        messageDiv.className = 'message error';
        return;
    }
    
    const kills = parseInt(document.getElementById('kills').value) || 0;
    const placement = parseInt(document.getElementById('placement').value) || 0;
    const score = parseInt(document.getElementById('totalPreview').textContent);
    
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    
    submitBtn.disabled = true;
    messageDiv.textContent = 'Uploading...';
    
    try {
        // Upload screenshot if one is selected
        let uploadedScreenshotURL = null;
        if (screenshotFile) {
            console.log('Screenshot file detected, uploading...');
            uploadedScreenshotURL = await uploadScreenshot();
            console.log('Upload result:', uploadedScreenshotURL);
        } else {
            console.log('No screenshot file selected');
        }
        
        // Prepare update data
        const updateData = {
            kills,
            placement,
            score,
            lastUpdated: new Date().toISOString()
        };
        
        // Add screenshot URL if uploaded
        if (uploadedScreenshotURL) {
            updateData.screenshotURL = uploadedScreenshotURL;
            updateData.screenshotTimestamp = new Date().toISOString();
            console.log('Adding screenshot to update:', updateData.screenshotURL);
        }
        
        console.log('Updating team document with data:', updateData);
        await updateDoc(doc(db, 'teams', currentTeamId), updateData);
        console.log('Team document updated successfully');
        
        messageDiv.textContent = uploadedScreenshotURL 
            ? '✅ Score and screenshot updated successfully!'
            : '✅ Score updated successfully!';
        messageDiv.className = 'message success';
        
        // Clear screenshot preview after successful submission
        if (uploadedScreenshotURL) {
            screenshotFile = null;
            screenshotURL = null;
            document.getElementById('uploadPreview').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'block';
        }
        
        setTimeout(() => {
            messageDiv.classList.add('hide');
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }, 500);
        }, 3000);
    } catch (error) {
        console.error('Update error:', error);
        messageDiv.textContent = '❌ Failed to update. Check permissions.';
        messageDiv.className = 'message error';
        submitBtn.disabled = false;
        
        setTimeout(() => {
            messageDiv.classList.add('hide');
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }, 500);
        }, 4000);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
});
