// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  // connectFirestoreEmulator,
  // doc,
  // setDoc,
  // Firestore,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// place holder for firebase config
// const firebaseConfig = {
//   apiKey: "fake-api-key",
//   projectId: "fake-project-id",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// async function seedData(database: Firestore) {
//   console.log("Starting dynamic data seeding...");

//   // Example: Seed a 'settings' document
//   const settingsRef = doc(database, "settings", "config");
//   await setDoc(settingsRef, {
//     appName: "Local Dev App",
//     version: "1.0.0-dev",
//     lastSeeded: new Date().toISOString(),
//   });

//   // Example: Seed a test user
//   const userRef = doc(database, "users", "dev_user");
//   await setDoc(userRef, {
//     name: "Dev User",
//     role: "tester",
//     active: true,
//   });

//   console.log("Dynamic data seeding complete.");
// }

// if (typeof window !== "undefined" && window.location.hostname === "localhost") {
//   console.log("Connecting to Firestore Emulator...");
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);

//   seedData(db).catch(console.error);
// }

export default db;
