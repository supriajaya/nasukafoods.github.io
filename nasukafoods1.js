const firebaseConfig = {
    apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
    authDomain: "nasuka-fc780.firebaseapp.com",
    databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasuka-fc780",
    messagingSenderId: "860641747257",
    appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  const localUser = {
    Username: localStorage.getItem("Username"),
    Nama: localStorage.getItem("Nama"),
    Perak: parseInt(localStorage.getItem("Perak")) || 0,
    TotalLoss: parseInt(localStorage.getItem("TotalLoss")) || 0,
    operatorCapital: 1000
  };

  if (!localUser.Username) {
    console.log("Username tidak ditemukan di localStorage. Silakan login.");
  }

  const userRef = db.ref(`users/${localUser.Username}`);
  const operatorCapitalRef = db.ref(`users/${localUser.Username}/operatorCapital`);

  userRef.on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData !== null) {
          localUser.Perak = userData.Perak || 0;
          localUser.TotalLoss = userData.TotalLoss || 0;
          
          localStorage.setItem("Perak", localUser.Perak);
          localStorage.setItem("TotalLoss", localUser.TotalLoss);
          
          updatePerakDisplay();
          console.log("Saldo dan total kekalahan berhasil disinkronkan.");
      }
  });

  operatorCapitalRef.on('value', (snapshot) => {
    const capitalData = snapshot.val();
    if (capitalData !== null) {
      localUser.operatorCapital = capitalData;
    } else {
      localUser.operatorCapital = 1000;
      operatorCapitalRef.set(1000); 
      console.log("Modal operator baru diinisialisasi.");
    }
    updateOperatorCapitalDisplay();
  });
