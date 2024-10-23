// No changes needed here if you are already using the modular import as you mentioned.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDc2RVWe7GnH5fQU7syw8UYggY43I5y0p8",
  authDomain: "apni-society-e1de9.firebaseapp.com",
  projectId: "apni-society-e1de9",
  storageBucket: "apni-society-e1de9.appspot.com",
  messagingSenderId: "562531611981",
  appId: "1:562531611981:web:fb68e472b98db3f47f3304",
  measurementId: "G-LGCVJGFJQX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Use getFirestore
export const storage = getStorage(app);
