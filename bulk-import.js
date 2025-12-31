// BULK IMPORT SCRIPT - Run this to create all teams at once
// Instructions: Open index.html in browser, open Console (F12), paste this code, press Enter

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCio8kkBavGfdUECfFadDGRvhLyO3DlBwI",
    authDomain: "freefire-thinkbotz.firebaseapp.com",
    projectId: "freefire-thinkbotz",
    storageBucket: "freefire-thinkbotz.firebasestorage.app",
    messagingSenderId: "513327286952",
    appId: "1:513327286952:web:e8ef8fca42f09d2b5c509d",
    measurementId: "G-K0MWN4P9PF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Team data with UIDs
const teams = [
    { id: 'team01', name: 'Team1', uid: 'UnzSi7QdvBdWjQZ7ZGwPhsiJc1p2' },
    { id: 'team02', name: 'Team2', uid: 'cEGnEytN29bWFTuIepfJnTSGsYd2' },
    { id: 'team03', name: 'Team3', uid: '8h4nJF9k9qNue6zC0FrA2kw74WT2' },
    { id: 'team04', name: 'Team4', uid: 'ZZcM7wDm43S7GPYWgPN02x7JBCo2' },
    { id: 'team05', name: 'Team5', uid: 'LAE9FJQSX1deQQAQnZbwBsYTcNH3' },
    { id: 'team06', name: 'Team6', uid: '2QmDKW95LANGSP9br9XaRcIa61G3' },
    { id: 'team07', name: 'Team7', uid: 'wqUzOFXg2lbwyg0lLWpoQHX2rP52' },
    { id: 'team08', name: 'Team8', uid: 'c3xF4tt4jZTcXvxTd9P5pX9MsOK2' },
    { id: 'team09', name: 'Team9', uid: 'K8YESYHeBFa5kI0ggOeLHLoxLQF2' },
    { id: 'team10', name: 'Team10', uid: 'ef2r57ufdUfmINjBUplr48njj8C3' },
    { id: 'team11', name: 'Team11', uid: 'b3JkZwmOktZwX67VDukgZfuG39C3' },
    { id: 'team12', name: 'Team12', uid: 'SsKspKn3GGQfoGzApcAhcT4lCqv1' },
    { id: 'team13', name: 'Team13', uid: '2dIdYGQrxFW4Mz0YUuiOOqK6LG72' },
    { id: 'team14', name: 'Team14', uid: 'TGKbC8xIfFdeAkgjTIC64lhcgqQ2' },
    { id: 'team15', name: 'Team15', uid: 'X4TUw2FtqweBnUNUc8MWzDeF93s1' },
    { id: 'team16', name: 'Team16', uid: 'jO1Dt4xKakbsuuScAEUozebJAQK2' },
    { id: 'team17', name: 'Team17', uid: 'LZyAWgYkt8MB94vYIMLdgiKuMLE2' },
    { id: 'team18', name: 'Team18', uid: 'OmbIR6psnvf1vjZuwRXOwmaqH8y1' },
    { id: 'team19', name: 'Team19', uid: 'tDoMVofFGvZro44pEhikm6PLWME3' },
    { id: 'team20', name: 'Team20', uid: 'wOqamR5cTlS29QfYURNRNowQF4h1' }
];

async function createAllTeams() {
    console.log('🚀 Starting bulk import...');
    
    for (const team of teams) {
        try {
            await setDoc(doc(db, 'teams', team.id), {
                name: team.name,
                kills: 0,
                placement: 0,
                score: 0,
                coordinatorUID: team.uid
            });
            console.log(`✅ Created ${team.id} - ${team.name}`);
        } catch (error) {
            console.error(`❌ Failed to create ${team.id}:`, error);
        }
    }
    
    // Create admin/matchLock document
    try {
        await setDoc(doc(db, 'admin', 'matchLock'), {
            locked: false,
            lastModified: ''
        });
        console.log('✅ Created admin/matchLock');
    } catch (error) {
        console.error('❌ Failed to create admin/matchLock:', error);
    }
    
    console.log('🎉 Bulk import complete!');
}

async function loginAndRun() {
    try {
        console.log('🔐 Signing in as admin...');
        await signInWithEmailAndPassword(auth, 'admin@thinkbotz.com', 'Asdf4321');
        console.log('✅ Admin signed in.');
        await createAllTeams();
    } catch (error) {
        console.error('❌ Admin login failed:', error);
    }
}

// Run the import after admin login
loginAndRun();
