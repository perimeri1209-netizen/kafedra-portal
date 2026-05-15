// src/firebase.js

import { initializeApp } from 'firebase/app';

import {
  getAnalytics,
  isSupported
} from 'firebase/analytics';

import {
  getAuth,
  signOut
} from 'firebase/auth';

import {
  getFirestore,
  enableNetwork,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCMmNk2J7elk8Msy6T-YXCYf5CxjaDgsRw',
  authDomain: 'mtkafedra-204c1.firebaseapp.com',
  databaseURL: 'https://mtkafedra-204c1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mtkafedra-204c1',
  storageBucket: 'mtkafedra-204c1.firebasestorage.app',
  messagingSenderId: '533726472994',
  appId: '1:533726472994:web:d13536a39e0cb85d91937b',
  measurementId: 'G-LV0TBVE2XG'
};

const app = initializeApp(firebaseConfig);

let analytics = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn('Analytics is not supported:', error);
    analytics = null;
  });

const auth = getAuth(app);
const db = getFirestore(app);

enableNetwork(db).catch((error) => {
  console.warn('Firestore network error:', error);
});

export {
  app,
  analytics,

  // Auth
  auth,
  signOut,

  // Firestore database
  db,

  // Firestore functions
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
};