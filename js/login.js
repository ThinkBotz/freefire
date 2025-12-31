import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Whitelist of allowed coordinator usernames (ONLY THESE CAN LOGIN)
const ALLOWED_COORDINATORS = [
    'team1', 'team2', 'team3', 'team4', 'team5',
    'team6', 'team7', 'team8', 'team9', 'team10',
    'team11', 'team12', 'team13', 'team14', 'team15',
    'team16', 'team17', 'team18', 'team19', 'team20'
];

// Your domain for coordinator emails (change this to your actual domain)
const COORDINATOR_DOMAIN = '@thinkbotz.com';

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin (has your actual email domain or specific admin email)
        if (user.email.includes('admin@') || user.email === 'admin@thinkbotz.com') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'coordinator.html';
        }
    }
});

// Role switching
const roleBtns = document.querySelectorAll('.role-btn');
const coordinatorForm = document.getElementById('coordinatorForm');
const adminForm = document.getElementById('adminForm');

roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        
        // Update active state
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show/hide forms
        if (role === 'coordinator') {
            coordinatorForm.classList.add('active');
            adminForm.classList.remove('active');
        } else {
            coordinatorForm.classList.remove('active');
            adminForm.classList.add('active');
        }
        
        // Clear errors
        document.getElementById('coordinatorError').textContent = '';
        document.getElementById('adminError').textContent = '';
    });
});

// Handle Coordinator Login (Username-based)
coordinatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('coordinatorUsername').value.toLowerCase().trim();
    const password = document.getElementById('coordinatorPassword').value;
    const errorDiv = document.getElementById('coordinatorError');
    
    errorDiv.textContent = '';
    
    // Check if username is in whitelist
    if (!ALLOWED_COORDINATORS.includes(username)) {
        errorDiv.textContent = '❌ Invalid username. Not authorized.';
        return;
    }
    
    // Convert username to email format
    const email = username + COORDINATOR_DOMAIN;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        let message = 'Login failed. Check credentials.';
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            message = '❌ Invalid username or password.';
        } else if (error.code === 'auth/user-not-found') {
            message = '❌ Account not found. Contact admin.';
        } else if (error.code === 'auth/too-many-requests') {
            message = '❌ Too many attempts. Try again later.';
        }
        
        errorDiv.textContent = message;
    }
});

// Handle Admin Login (Email-based)
adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminError');
    
    errorDiv.textContent = '';
    
    // Only allow admin email login here
    if (!email.includes('admin@') && email !== 'samxiao@admin.com') {
        errorDiv.textContent = '❌ Admin credentials required.';
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        let message = 'Login failed. Check credentials.';
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            message = '❌ Invalid email or password.';
        } else if (error.code === 'auth/user-not-found') {
            message = '❌ Admin account not found.';
        } else if (error.code === 'auth/too-many-requests') {
            message = '❌ Too many attempts. Try again later.';
        }
        
        errorDiv.textContent = message;
    }
});
