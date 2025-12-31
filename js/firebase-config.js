// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCio8kkBavGfdUECfFadDGRvhLyO3DlBwI",
    authDomain: "freefire-thinkbotz.firebaseapp.com",
    projectId: "freefire-thinkbotz",
    storageBucket: "freefire-thinkbotz.firebasestorage.app",
    messagingSenderId: "513327286952",
    appId: "1:513327286952:web:e8ef8fca42f09d2b5c509d",
    measurementId: "G-K0MWN4P9PF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
