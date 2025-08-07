document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDE17I5nEIdrfQhfRP5ewloydX18Sw47ws",
    authDomain: "nasukachat.firebaseapp.com",
    databaseURL: "https://nasukachat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasukachat",
    storageBucket: "nasukachat.firebasestorage.app",
    messagingSenderId: "759589458121",
    appId: "1:759589458121:web:d5670da0d080017e2ffd18"
  };
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();
});
