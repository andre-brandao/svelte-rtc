// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX8RdLacTgPckSX_X6WJv-Aqihgxrkfe0",
  authDomain: "svelte-rtc.firebaseapp.com",
  projectId: "svelte-rtc",
  storageBucket: "svelte-rtc.appspot.com",
  messagingSenderId: "79417124732",
  appId: "1:79417124732:web:b21101b1dbed51967466f9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
