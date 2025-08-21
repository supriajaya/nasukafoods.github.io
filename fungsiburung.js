let totalPerakBurung = 0;

document.addEventListener("DOMContentLoaded", () => {
    const totalPerakSpan = document.getElementById("total-perak");
    let totalPerak = 0;

    const inputs = document.querySelectorAll('.input-circle');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.checked) {
                totalPerak++;
                totalPerakSpan.textContent = totalPerak;
            } else {
                totalPerak--;
                totalPerakSpan.textContent = totalPerak;
            }
        });
    });

    const selesaiBtn = document.getElementById("selesaiBtn");
    selesaiBtn.addEventListener("click", () => {
        if (localUser.Username && totalPerak > 0) {
            const usersRef = db.ref('users');
            usersRef.orderByChild('Username').equalTo(localUser.Username).once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const userId = childSnapshot.key;
                            let currentPerak = childSnapshot.val().Perak ? parseInt(childSnapshot.val().Perak) : 0;
                            let newPerak = currentPerak + totalPerak;

                            return db.ref('users/' + userId).update({ Perak: newPerak })
                                .then(() => {
                                    showCustomAlert(` ${totalPerak} Perak berhasil diklaim!`, "success");
                                    totalPerak = 0;
                                    totalPerakSpan.textContent = totalPerak;
                                    inputs.forEach(input => input.checked = false);
                                });
                        });
                    } else {
                        showCustomAlert("Pengguna tidak ditemukan.", "error");
                    }
                })
                .catch(error => {
                    console.error("Gagal mengirim perak:", error);
                    showCustomAlert("Gagal mengirim perak. Silakan coba lagi.", "error");
                });
        } else {
            showCustomAlert("Tidak ada perak yang di klaim", "info");
        }
    });
});
