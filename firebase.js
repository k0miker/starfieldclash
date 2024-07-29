// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8_poLsdzAld5Pv0s9JVKx7TtHwG2LZnM",
  authDomain: "starfieldhighscore.firebaseapp.com",
  projectId: "starfieldhighscore",
  storageBucket: "starfieldhighscore.appspot.com",
  messagingSenderId: "249222153616",
  appId: "1:249222153616:web:5ec1cc5b3b85bde8cf9f15",
  measurementId: "G-TFYTPSM053"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);