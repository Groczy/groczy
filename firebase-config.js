// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA2YHOWUAIiSP0O6RWKLr7pXzBbGFfeCGs",
  authDomain: "groczy-9474a.firebaseapp.com",
  projectId: "groczy-9474a",
  storageBucket: "groczy-9474a.firebasestorage.app",
  messagingSenderId: "473000346453",
  appId: "1:473000346453:web:cd99e10f4cd847b955a5dc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = firebase.firestore();
