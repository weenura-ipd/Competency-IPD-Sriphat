import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBuAY2M3G9AJUoC8QiZ8fE64Rpt-3Z45xo",
  authDomain: "ipd-competency.firebaseapp.com",
  projectId: "ipd-competency",
  storageBucket: "ipd-competency.firebasestorage.app",
  messagingSenderId: "123735641396",
  appId: "1:123735641396:web:46ce0c29ba840ed4d9a961",
  measurementId: "G-6VWRXC7P4E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
