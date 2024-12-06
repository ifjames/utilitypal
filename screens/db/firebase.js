import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPNMQ14UPqhwrZMWTx3SGZKojmn63rfg8",
  authDomain: "utilitypal-78858.firebaseapp.com",
  projectId: "utilitypal-78858",
  storageBucket: "utilitypal-78858.appspot.com",
  messagingSenderId: "97096721982",
  appId: "1:97096721982:web:1d855cc29f8a5559193e0d",
  measurementId: "G-MV9ZDQST5K",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };
