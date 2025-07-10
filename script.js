const GAS_URL = 'https://script.google.com/macros/s/AKfycby84KGedeLwHiRBb4O0_rkzhYQh6r2-HgwtD_gcq6ubVwFy8jn_GbSxiBjctKm2b9ruZg/exec';
// Menggunakan link default sesuai instruksi
const DEFAULT_PRODUCT_LINK = 'https://aryawilalodra.site';
// Menggunakan gambar default sesuai instruksi
const DEFAULT_IMAGE_URL = 'http://nasukafoods.site/image/sosial-media.png';

let loggedInUser = null;

function saveUserToLocalStorage(userData) {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    loggedInUser = userData;
    updateWelcomeMessage();
    updateNavigationButtons();
}

function loadUserFromLocalStorage() {
    const userDataString = localStorage.getItem('loggedInUser');
    if (userDataString) {
        loggedInUser = JSON.parse(userDataString);
        updateWelcomeMessage();
        return true;
    }
    return false;
}

function removeUserFromLocalStorage() {
    localStorage.removeItem('loggedInUser');
    loggedInUser = null;
    updateWelcomeMessage();
    updateNavigationButtons();
}

function updateWelcomeMessage() {
    const welcomeMessageDiv = document.getElementById('welcomeMessage');
    if (loggedInUser && loggedInUser['Nama Lengkap']) {
        welcomeMessageDiv.innerText = `Hai, ${loggedInUser['Nama Lengkap']}`;
    } else {
        welcomeMessageDiv.innerText = 'Hai, Tamu';
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + 'Section').classList.add('active');
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.display = 'none';
        msg.classList.remove('success', 'error');
        msg.innerText = '';
    });

    if (sectionId === 'profile') {
        if (loggedInUser) {
            displayProfile();
            document.getElementById('editProfileButton').style.display = 'block';
        } else {
            const profileMessage = document.getElementById('profileMessage');
            profileMessage.classList.add('error');
            profileMessage.innerText = 'Anda harus login untuk melihat profil.';
            profileMessage.style.display = 'block';
            document.getElementById('profileData').style.display = 'none';
            document.getElementById('editProfileButton').style.display = 'none';
        }
    } else if (sectionId === 'editProfile') {
        if (loggedInUser) {
            populateEditProfileForm();
        } else {
            showSection('login');
        }
    } else if (sectionId === 'orderHistory') {
        if (loggedInUser) {
            loadOrderHistory(loggedInUser['Nomor HP']);
        } else {
            const orderHistoryMessage = document.getElementById('orderHistoryMessage');
            orderHistoryMessage.classList.add('error');
            orderHistoryMessage.innerText = 'Anda harus login untuk melihat riwayat pesanan.';
            orderHistoryMessage.style.display = 'block';
            document.getElementById('orderHistoryList').innerHTML = '';
            document.getElementById('noOrderHistoryMessage').style.display = 'none';
        }
    } else if (sectionId === 'order') {
        updateOrderFormVisibility();
    }
}

function updateOrderFormVisibility() {
    const isMember = loggedInUser !== null;
    document.getElementById('formGroupNomorHP').style.display = isMember ? 'none' : 'block';
    document.getElementById('formGroupAlamat').style.display = isMember ? 'none' : 'block';
    document.getElementById('formGroupUsername').style.display = isMember ? 'none' : 'block';

    document.getElementById('formGroupProduk').style.display = 'block';
    document.getElementById('formGroupKuantitas').style.display = 'block';
    document.getElementById('formGroupTotalHarga').style.display = 'block';

    if (isMember) {
        document.getElementById('ordNomorHP').removeAttribute('required');
        document.getElementById('ordAlamat').removeAttribute('required');
        document.getElementById('ordUsername').removeAttribute('required');
    } else {
        document.getElementById('ordNomorHP').setAttribute('required', 'required');
        document.getElementById('ordAlamat').setAttribute('required', 'required');
        document.getElementById('ordUsername').removeAttribute('required');
    }
    
    document.getElementById('orderDetailSummary').style.display = isMember ? 'block' : 'none';
    if (isMember) {
        document.getElementById('summaryTipePelanggan').innerText = 'Member';
        document.getElementById('summaryNamaLengkap').innerText = loggedInUser['Nama Lengkap'] || '-';
        document.getElementById('summaryNomorHP').innerText = loggedInUser['Nomor HP'] || '-';
        document.getElementById('summaryAlamat').innerText = loggedInUser['Alamat Lengkap'] || '-';
        document.getElementById('summaryUsername').innerText = loggedInUser['Username'] || '-';
        document.getElementById('summarySisaSaldo').innerText = loggedInUser['Saldo'] !== undefined ? `Rp ${parseFloat(loggedInUser['Saldo']).toLocaleString('id-ID')}` : '-';
    } else {
        document.getElementById('summaryTipePelanggan').innerText = 'N/A';
        document.getElementById('summaryNamaLengkap').innerText = 'N/A';
        document.getElementById('summarySisaSaldo').innerText = 'N/A';
    }

    const metodePembayaranOrd = document.getElementById('metodePembayaranOrd').value;
    const buktiPembayaranGroup = document.getElementById('formGroupBuktiPembayaran');
    const buktiPembayaranFile = document.getElementById('buktiPembayaranFile');

    if (metodePembayaranOrd === 'Saldo Akun' || metodePembayaranOrd === 'Cash on Delivery') {
        buktiPembayaranGroup.style.display = 'none';
        buktiPembayaranFile.removeAttribute('required');
    } else if (metodePembayaranOrd !== '') { // Only show if a payment method requiring proof is selected
        buktiPembayaranGroup.style.display = 'block';
        buktiPembayaranFile.setAttribute('required', 'required');
    } else {
        buktiPembayaranGroup.style.display = 'none';
        buktiPembayaranFile.removeAttribute('required');
    }
}

async function submitForm(formId, actionType, messageId) {
    const form = document.getElementById(formId);
    const messageDiv = document.getElementById(messageId);
    messageDiv.style.display = 'none';
    messageDiv.classList.remove('success', 'error');
    messageDiv.innerText = '';

    let requestBody = new FormData(form);
    requestBody.append('action', actionType);

    let fileInput;
    let fileParamName;

    if (actionType === 'deposit') {
        fileInput = document.getElementById('buktiTransferFile');
        fileParamName = 'buktiTransfer';
    } else if (actionType === 'order') {
        const metodePembayaran = document.getElementById('metodePembayaranOrd').value;
        if (metodePembayaran !== 'Saldo Akun' && metodePembayaran !== 'Cash on Delivery') {
            fileInput = document.getElementById('buktiPembayaranFile');
            fileParamName = 'buktiPembayaran';
        }
    }

    const file = fileInput ? fileInput.files[0] : null;

    if (fileInput && fileInput.hasAttribute('required') && !file) {
        messageDiv.classList.add('error');
        messageDiv.innerText = 'Mohon unggah file yang diperlukan.';
        messageDiv.style.display = 'block';
        return;
    }

    if (file) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            messageDiv.classList.add('error');
            messageDiv.innerText = 'Ukuran file terlalu besar. Maksimal 5MB.';
            messageDiv.style.display = 'block';
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        await new Promise((resolve, reject) => {
            reader.onloadend = function() {
                const base64data = reader.result.split(',')[1];
                requestBody.append(fileParamName, base64data);
                requestBody.append('fileName', file.name);
                requestBody.append('mimeType', file.type);
                resolve();
            };
            reader.onerror = function(error) {
                messageDiv.classList.add('error');
                messageDiv.innerText = 'Error membaca file: ' + error.message;
                messageDiv.style.display = 'block';
                reject(error);
            };
        });
    } else if (actionType === 'order' && fileParamName === 'buktiPembayaran') {
        // Ensure buktiPembayaran is explicitly set to empty if no file is uploaded and it's not required
        requestBody.append('buktiPembayaran', '');
    }


    if (actionType === 'order') {
        if (loggedInUser) {
            requestBody.set('tipePelanggan', 'Member');
            requestBody.set('nomorHP', loggedInUser['Nomor HP']);
            requestBody.set('alamat', loggedInUser['Alamat Lengkap'] || '');
            requestBody.set('username', loggedInUser['Username'] || '');
        } else {
            requestBody.set('tipePelanggan', 'Tamu');
        }
        requestBody.set('produk', document.getElementById('produk').value);
        requestBody.set('kuantitas', document.getElementById('kuantitas').value);
        requestBody.set('totalHarga', document.getElementById('totalHarga').value);
        // Set statusPesanan dan bonus menjadi string kosong
        requestBody.set('statusPesanan', '');
        requestBody.set('bonus', '');
    }

    console.log('Sending request for action:', actionType);
    for (let pair of requestBody.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: requestBody
        });
        const result = await response.json();

        if (result.status === 'success') {
            messageDiv.classList.add('success');
            messageDiv.innerText = result.message;
            form.reset();

            if (actionType === 'login') {
                saveUserToLocalStorage(result.data);
                updateNavigationButtons();
                showSection('home');
            } else if (actionType === 'signup') {
                showSection('login');
            } else if (actionType === 'updateProfile' || (actionType === 'order' && document.getElementById('metodePembayaranOrd').value === 'Saldo Akun')) {
                if (loggedInUser) {
                    const refreshFormData = new FormData();
                    refreshFormData.append('action', 'refreshUserData');
                    refreshFormData.append('customerID', loggedInUser['Customers ID']);
                    const refreshResponse = await fetch(GAS_URL, {
                        method: 'POST',
                        body: refreshFormData
                    });
                    const refreshResult = await refreshResponse.json();
                    if (refreshResult.status === 'success') {
                        saveUserToLocalStorage(refreshResult.data);
                        if (actionType === 'updateProfile') {
                            displayProfile();
                            showSection('profile');
                        } else if (actionType === 'order') {
                            updateOrderFormVisibility();
                        }
                    } else {
                        console.error('Gagal memperbarui data user setelah aksi:', refreshResult.message);
                        alert('Profil berhasil diperbarui/Saldo terpotong, namun ada masalah dalam memuat data terbaru. Silakan refresh halaman.');
                    }
                }
            }

            if (actionType === 'order') {
                document.getElementById('summaryProduk').innerText = '';
                document.getElementById('summaryKuantitas').innerText = '';
                document.getElementById('summaryTotalHarga').innerText = '';
                document.getElementById('summaryCatatan').innerText = '';
                document.getElementById('summaryMetodePembayaran').innerText = '';
                document.getElementById('summaryBuktiPembayaran').innerText = ''; // Clear for next order
                document.getElementById('summaryStatusPesanan').innerText = ''; // Kosongkan
                document.getElementById('summaryBonus').innerText = ''; // Kosongkan
                document.getElementById('metodePembayaranOrd').value = '';
                document.getElementById('buktiPembayaranFile').value = '';
                updateOrderFormVisibility();
            }

        } else {
            messageDiv.classList.add('error');
            messageDiv.innerText = result.message;
        }
        messageDiv.style.display = 'block';
    } catch (error) {
        messageDiv.classList.add('error');
        messageDiv.innerText = 'Terjadi kesalahan jaringan atau server: ' + error.message;
        messageDiv.style.display = 'block';
        console.error('Fetch error:', error);
    }
}

async function loadOrderHistory(nomorHP) {
    const orderHistoryListDiv = document.getElementById('orderHistoryList');
    const orderHistoryMessageDiv = document.getElementById('orderHistoryMessage');
    const noOrderHistoryMessage = document.getElementById('noOrderHistoryMessage');

    orderHistoryListDiv.innerHTML = '';
    orderHistoryMessageDiv.style.display = 'none';
    orderHistoryMessageDiv.classList.remove('success', 'error');
    noOrderHistoryMessage.style.display = 'none';

    const formData = new FormData();
    formData.append('action', 'getOrderHistory');
    formData.append('nomorHP', nomorHP);

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            result.data.forEach(order => {
                const orderItemDiv = document.createElement('div');
                orderItemDiv.classList.add('order-item');
                orderItemDiv.innerHTML = `
                    <p><strong>Tanggal:</strong> ${order['Tanggal'] || '-'}</p>
                    <p><strong>Tipe Pelanggan:</strong> ${order['Tipe Pelanggan'] || '-'}</p>
                    <p><strong>Nomor HP:</strong> ${order['Nomor HP'] || '-'}</p>
                    <p><strong>Alamat:</strong> ${order['Alamat'] || '-'}</p>
                    <p><strong>Username:</strong> ${order['Username'] || '-'}</p>
                    <p><strong>Produk:</strong> ${order['Produk'] || '-'}</p>
                    <p><strong>Kuantitas:</strong> ${order['Kuantitas'] !== undefined ? order['Kuantitas'] : '-'}</p>
                    <p><strong>Total Harga:</strong> Rp ${order['Total Harga'] !== undefined ? parseFloat(order['Total Harga']).toLocaleString('id-ID') : '-'}</p>
                    <p><strong>Catatan:</strong> ${order['Catatan'] || '-'}</p>
                    <p><strong>Metode Pembayaran:</strong> ${order['Metode Pembayaran'] || '-'}</p>
                    <p><strong>Bukti Pembayaran:</strong> ${order['Bukti Pembayaran'] ? `<a href="${order['Bukti Pembayaran']}" target="_blank">Lihat Bukti</a>` : '-'}</p>
                    <p><strong>Status Pesanan:</strong> ${order['Status Pesanan'] || '-'}</p>
                    <p><strong>Bonus:</strong> ${order['Bonus'] || '-'}</p>
                `;
                orderHistoryListDiv.appendChild(orderItemDiv);
            });
        } else if (result.status === 'success' && result.data.length === 0) {
            noOrderHistoryMessage.style.display = 'block';
        } else {
            orderHistoryMessageDiv.classList.add('error');
            orderHistoryMessageDiv.innerText = result.message || 'Gagal memuat riwayat pesanan.';
            orderHistoryMessageDiv.style.display = 'block';
        }
    } catch (error) {
        orderHistoryMessageDiv.classList.add('error');
        orderHistoryMessageDiv.innerText = 'Terjadi kesalahan saat memuat riwayat pesanan: ' + error.message;
        orderHistoryMessageDiv.style.display = 'block';
        console.error('Fetch error for order history:', error);
    }
}

function displayProfile() {
    if (loggedInUser) {
        document.getElementById('profileCustID').innerText = loggedInUser['Customers ID'] || '-';
        document.getElementById('profileNamaLengkap').innerText = loggedInUser['Nama Lengkap'] || '-';
        document.getElementById('profileAlamatLengkap').innerText = loggedInUser['Alamat Lengkap'] || '-';
        document.getElementById('profileNomorHP').innerText = loggedInUser['Nomor HP'] || '-';
        document.getElementById('profileUsername').innerText = loggedInUser['Username'] || '-';
        document.getElementById('profileTentangSaya').innerText = loggedInUser['Tentang Saya'] || '-';
        document.getElementById('profileSaldo').innerText = loggedInUser['Saldo'] !== undefined ? `Rp ${parseFloat(loggedInUser['Saldo']).toLocaleString('id-ID')}` : '-';
        document.getElementById('profileTanggalDaftar').innerText = loggedInUser['Tanggal Daftar'] || '-';
        document.getElementById('profileData').style.display = 'block';
        document.getElementById('profileMessage').style.display = 'none';
    } else {
        const profileMessage = document.getElementById('profileMessage');
        profileMessage.classList.add('error');
        profileMessage.innerText = 'Anda belum login.';
        profileMessage.style.display = 'block';
        document.getElementById('profileData').style.display = 'none';
    }
}

function populateEditProfileForm() {
    if (loggedInUser) {
        document.getElementById('editProfileCustomerID').value = loggedInUser['Customers ID'] || '';
        document.getElementById('editNamaLengkap').value = loggedInUser['Nama Lengkap'] || '';
        document.getElementById('editAlamatLengkap').value = loggedInUser['Alamat Lengkap'] || '';
        document.getElementById('editNomorHP').value = loggedInUser['Nomor HP'] || '';
        document.getElementById('editTentangSaya').value = loggedInUser['Tentang Saya'] || '';
        document.getElementById('editPassword').value = '';
    }
}

function updateNavigationButtons() {
    const isLoggedIn = loggedInUser !== null;
    document.getElementById('navLogin').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('navSignup').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('navHome').style.display = 'inline-block';
    document.getElementById('navOrder').style.display = 'none'; /* Changed to none */
    document.getElementById('navProfile').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navOrderHistory').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navDeposit').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navLogout').style.display = isLoggedIn ? 'inline-block' : 'none';
}

function logout() {
    removeUserFromLocalStorage();
    alert('Anda telah logout.');
    showSection('home');
}

function ensureCountryCode(inputElement) {
    const prefix = "62";
    let value = inputElement.value;
    // Only set the value if it's empty or doesn't start with the prefix
    if (!value.startsWith(prefix)) {
        value = prefix + value.replace(/^0+/, '').replace(/[^0-9]/g, '');
        if (value.length > prefix.length && value.startsWith('620')) {
            value = prefix + value.substring(3);
        } else if (value.length < prefix.length) {
            value = prefix;
        }
    }
    inputElement.value = value;
    // Set cursor to the end when input is focused, only if it's new or not manually typing
    if (document.activeElement === inputElement && value === prefix && event && event.type === 'focus') {
        const len = inputElement.value.length;
        inputElement.setSelectionRange(len, len);
    }
}

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await submitForm('signupForm', 'signup', 'signupMessage');
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await submitForm('loginForm', 'login', 'loginMessage');
});

document.getElementById('depositForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitForm('depositForm', 'deposit', 'depositMessage');
});

document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitForm('orderForm', 'order', 'orderMessage');
});

document.getElementById('editProfileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitForm('editProfileForm', 'updateProfile', 'editProfileMessage');
});

document.getElementById('editProfileButton').addEventListener('click', function() {
    showSection('editProfile');
});

document.getElementById('kuantitas').addEventListener('input', function() {
    const quantity = parseInt(this.value);
    const originalPrice = parseFloat(document.getElementById('totalHargaHidden').value);
    const totalPrice = originalPrice * quantity;
    document.getElementById('totalHarga').value = totalPrice;
    document.getElementById('summaryTotalHarga').innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    document.getElementById('summaryKuantitas').innerText = quantity;
});

document.querySelectorAll('.add-to-cart-button').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.dataset.productName;
        const productPrice = parseFloat(this.dataset.productPrice);

        document.getElementById('produk').value = productName;
        document.getElementById('kuantitas').value = 1;
        document.getElementById('totalHargaHidden').value = productPrice;
        document.getElementById('totalHarga').value = productPrice;
        document.getElementById('catatan').value = `Pembelian: ${productName}`;
        document.getElementById('metodePembayaranOrd').value = '';
        document.getElementById('buktiPembayaranFile').value = '';

        document.getElementById('summaryProduk').innerText = productName;
        document.getElementById('summaryKuantitas').innerText = 1;
        document.getElementById('summaryTotalHarga').innerText = `Rp ${productPrice.toLocaleString('id-ID')}`;
        document.getElementById('summaryCatatan').innerText = `Pembelian: ${productName}`;
        document.getElementById('summaryMetodePembayaran').innerText = 'Pilih Metode';
        document.getElementById('summaryBuktiPembayaran').innerText = '-'; // Initialize summary field
        document.getElementById('summaryStatusPesanan').innerText = ''; // Kosongkan di summary
        document.getElementById('summaryBonus').innerText = ''; // Kosongkan di summary

        if (loggedInUser) {
            document.getElementById('ordNomorHP').value = loggedInUser['Nomor HP'];
            document.getElementById('ordAlamat').value = loggedInUser['Alamat Lengkap'] || '';
            document.getElementById('ordUsername').value = loggedInUser['Username'] || '';
            document.getElementById('summaryTipePelanggan').innerText = 'Member';
            document.getElementById('summaryNamaLengkap').innerText = loggedInUser['Nama Lengkap'] || '-';
            document.getElementById('summaryNomorHP').innerText = loggedInUser['Nomor HP'] || '-';
            document.getElementById('summaryAlamat').innerText = loggedInUser['Alamat Lengkap'] || '-';
            document.getElementById('summaryUsername').innerText = loggedInUser['Username'] || '-';
            document.getElementById('summarySisaSaldo').innerText = loggedInUser['Saldo'] !== undefined ? `Rp ${parseFloat(loggedInUser['Saldo']).toLocaleString('id-ID')}` : '-';
        } else {
            document.getElementById('ordNomorHP').value = '';
            document.getElementById('ordAlamat').value = '';
            document.getElementById('ordUsername').value = '';
            document.getElementById('summaryTipePelanggan').innerText = 'N/A';
            document.getElementById('summaryNamaLengkap').innerText = 'N/A';
            document.getElementById('summaryNomorHP').innerText = 'N/A';
            document.getElementById('summaryAlamat').innerText = 'N/A';
            document.getElementById('summaryUsername').innerText = 'N/A';
            document.getElementById('summarySisaSaldo').innerText = 'N/A';
            alert('Silakan login atau masukkan Nomor HP dan Alamat Anda untuk melanjutkan pesanan.');
        }
        showSection('order');
        updateOrderFormVisibility();
    });
});

document.getElementById('metodePembayaranOrd').addEventListener('change', updateOrderFormVisibility);

document.getElementById('catatan').addEventListener('input', () => document.getElementById('summaryCatatan').innerText = document.getElementById('catatan').value);
document.getElementById('metodePembayaranOrd').addEventListener('change', () => document.getElementById('summaryMetodePembayaran').innerText = document.getElementById('metodePembayaranOrd').value);
document.getElementById('ordNomorHP').addEventListener('input', () => {
    if (!loggedInUser) document.getElementById('summaryNomorHP').innerText = document.getElementById('ordNomorHP').value
});
document.getElementById('ordAlamat').addEventListener('input', () => {
    if (!loggedInUser) document.getElementById('summaryAlamat').innerText = document.getElementById('ordAlamat').value
});
document.getElementById('ordUsername').addEventListener('input', () => {
    if (!loggedInUser) document.getElementById('summaryUsername').innerText = document.getElementById('ordUsername').value
});

document.addEventListener('DOMContentLoaded', () => {
    // Menghapus tag <a> dari sekitar elemen produk agar klik tidak langsung ke link
    document.querySelectorAll('.product-item-wrapper a, .divided-product-item a').forEach(link => {
        const parent = link.parentNode;
        while (link.firstChild) {
            parent.insertBefore(link.firstChild, link);
        }
        parent.removeChild(link);
    });

    // Ganti src kosong.jpg dengan gambar default
    document.querySelectorAll('img[src="https://nasukafoods.site/kosong.jpg"]').forEach(img => {
        img.src = DEFAULT_IMAGE_URL;
    });

    if (loadUserFromLocalStorage()) {
        updateNavigationButtons();
    } else {
        updateNavigationButtons();
    }
    showSection('home');
});
