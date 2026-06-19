// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { FacebookAuthProvider, getAuth, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBW5E95Brs3W-l5tjAVZXz0OcTg5jEGihk",
    authDomain: "entertainindia-web.firebaseapp.com",
    projectId: "entertainindia-web",
    storageBucket: "entertainindia-web.firebasestorage.app",
    messagingSenderId: "311369840498",
    appId: "1:311369840498:web:fc44c536f2da38d7ac0feb",
    measurementId: "G-BKX25YVBG5"
};

// Initialize Firebase only on client side
let app, auth, googleProvider, facebookProvider, twitterProvider, analytics;

if (typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    twitterProvider = new TwitterAuthProvider();
    analytics = getAnalytics(app);
} else {
    // Provide dummy exports for SSR
    app = null;
    auth = null;
    googleProvider = null;
    facebookProvider = null;
    twitterProvider = null;
    analytics = null;
}

export { analytics, auth, facebookProvider, googleProvider, twitterProvider };
