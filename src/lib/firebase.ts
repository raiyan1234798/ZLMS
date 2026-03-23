import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

let analytics: any = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    }).catch(() => {
        // Ignore analytics check errors
    });
}

if (process.env.NODE_ENV === 'development') {
    // Suppress noisy Firebase connection/permission logs in dev red overlay
    setLogLevel('silent');
}

const auth = getAuth(app);

// Use experimentalForceLongPolling to resolve QUIC_PROTOCOL_ERROR
import { initializeFirestore } from "firebase/firestore";
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { app, auth, db, analytics, googleProvider, storage };
