import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjPFLPIkSW8fJtBlQJK6KXZ3yDPE2YoHY",
  authDomain: "yout-inst.firebaseapp.com",
  projectId: "yout-inst",
  storageBucket: "yout-inst.firebasestorage.app",
  messagingSenderId: "322403818823",
  appId: "1:322403818823:web:471edad9e0bf00e3a90062",
  measurementId: "G-VNV1J98VY2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
