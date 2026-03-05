import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA7yulxGG30qAsfXmTd9yA1WJaIrEWeuuA",
    authDomain: "zlms-45365.firebaseapp.com",
    projectId: "zlms-45365",
    storageBucket: "zlms-45365.firebasestorage.app",
    messagingSenderId: "114014988837",
    appId: "1:114014988837:web:d31ed3efcd375bdaa56dcc",
    measurementId: "G-TWD8L1N797"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== 'undefined') {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, analytics, googleProvider };
