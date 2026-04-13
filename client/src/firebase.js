import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtHvGTs53FNsiSx7-kKhYKPGvEOaMCHRM",
  authDomain: "placement-portal-37f28.firebaseapp.com",
  projectId: "placement-portal-37f28",
  storageBucket: "placement-portal-37f28.firebasestorage.app",
  messagingSenderId: "458550059998",
  appId: "1:458550059998:web:dcb683ad7bd4dff514734f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
