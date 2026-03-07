import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBnxaWJTKy1A3mgvPr7MGjrWnvtrdWH0YQ",
    authDomain: "mayilon-jewellers.firebaseapp.com",
    projectId: "mayilon-jewellers",
    storageBucket: "mayilon-jewellers.firebasestorage.app",
    messagingSenderId: "202568161709",
    appId: "1:202568161709:web:471f7145876f04fee62924",
    measurementId: "G-YK6G42XK22"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
