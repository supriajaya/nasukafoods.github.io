
const ID = localStorage.getItem('ID') || '';
const Username = localStorage.getItem('Username') || '';
const Nama = localStorage.getItem('Nama') || '';
let currentTargetID = '';
let currentTargetNama = '';
let currentTargetFoto = '';
let currentTargetMode = 'publik';
const urlParams = new URLSearchParams(window.location.search);
const paramID = urlParams.get('id');
if (!ID) {
    alert("Gagal memuat data pengguna.");
    throw new Error("Missing user data.");
}
const chatBox = document.getElementById('chatBox');
const input = document.getElementById('inputMessage');
const targetFotoEl = document.getElementById('targetFotoEl');
const roomTitle = document.getElementById('roomTitle');
function loadTargetInfo(targetID) {
    return db.ref('users').orderByChild('ID').equalTo(targetID).once('value').then(snap => {
        let found = false;
        snap.forEach(userSnap => {
            const val = userSnap.val();
            currentTargetID = val.ID;
            currentTargetNama = val.Nama || 'Pengguna';
            currentTargetFoto = val.Foto || 'default.jpg';
            currentTargetMode = val.ModeChat || 'publik';
            found = true;
        });
        if (!found) {
            currentTargetID = targetID;
            currentTargetNama = 'Pengguna';
            currentTargetFoto = 'default.jpg';
            currentTargetMode = 'publik';
        }
    });
}
function formatWaktu(ms) {
    const d = new Date(ms);
    const jam = d.getHours().toString().padStart(2, '0');
    const mnt = d.getMinutes().toString().padStart(2, '0');
    return jam + ':' + mnt;
}
function tambahPesan(data) {
    const msgEl = document.createElement('div');
    msgEl.className = data.ID === ID ? 'msg me' : 'msg';
    const text = document.createElement('div');
    text.textContent = data.Pesan;
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatWaktu(data.Waktu || 0);
    msgEl.appendChild(text);
    msgEl.appendChild(time);
    chatBox.appendChild(msgEl);
    chatBox.scrollTop = chatBox.scrollHeight;
}
let activeChatListener = null;
function loadChat(room) {
    chatBox.innerHTML = '';
    if (activeChatListener) {
        db.ref(room).off('child_added', activeChatListener);
    }
    activeChatListener = snap => {
        const data = snap.val();
        tambahPesan(data);
    };
    db.ref(room).on('child_added', activeChatListener);
}
async function init() {
    if (paramID) {
        await loadTargetInfo(paramID);
        targetFotoEl.src = currentTargetFoto;
        roomTitle.textContent = currentTargetNama;
        currentTargetID = paramID;
        const room = [ID, currentTargetID].sort().join('_');
        loadChat('rooms/' + room + '/chats');
    } else {
        alert('ID target tidak ditemukan di URL');
        throw new Error('Missing target ID');
    }
}
function cekBolehKirim() {
    return new Promise(resolve => {
        if (currentTargetMode === 'publik') {
            resolve(true);
        } else {
            const room = [ID, currentTargetID].sort().join('_');
            db.ref('rooms/' + room + '/chats').once('value').then(snap => {
                let boleh = false;
                snap.forEach(c => {
                    const val = c.val();
                    if (val.ID === currentTargetID) {
                        boleh = true;
                    }
                });
                resolve(boh);
            });
        }
    });
}
function kirim() {
    const msg = input.value.trim();
    if (!msg) return;
    cekBolehKirim().then(boleh => {
        if (!boleh) {
            alert("Pengguna hanya menerima pesan dari orang yang sudah pernah dia kirimi pesan.");
            return;
        }
        const waktu = Date.now();
        const pesanData = { ID, Username, Nama, Pesan: msg, Waktu: waktu };
        const room = [ID, currentTargetID].sort().join('_');
        const chatRef = db.ref('rooms/' + room + '/chats');
        chatRef.push(pesanData).then(() => {
            const lastChatDataForMe = { room: room, ID: currentTargetID, Username: currentTargetNama, Foto: currentTargetFoto, Terakhir: msg, Waktu: waktu };
            const lastChatDataForTarget = { room: room, ID: ID, Username: Nama, Foto: '', Terakhir: msg, Waktu: waktu };
            const updates = {};
            updates[`users/${ID}/chats/${currentTargetID}`] = lastChatDataForMe;
            updates[`users/${currentTargetID}/chats/${ID}`] = lastChatDataForTarget;
            updates[`rooms/${room}/lastChat`] = { ID: ID, Nama: Nama, Pesan: msg, Waktu: waktu, readBy: { [ID]: true } };
            db.ref().update(updates);
            input.value = '';
            input.style.height = 'auto';
        }).catch(err => {
            alert("Gagal mengirim pesan: " + err.message);
        });
    });
}
input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
});
window.onload = init;
const userCache = {};
document.addEventListener("DOMContentLoaded", () => {
    const userID = localStorage.getItem("ID") || "";
    const fotoEl = document.getElementById("fotoProfil");
    const namaEl = document.getElementById("namaUser");
    const profilLink = document.getElementById("linkProfil");
    const notifInbox = document.getElementById("notifInbox");
    const hasilUserEl = document.getElementById("hasilUser");
    const daftar = document.getElementById("daftarPostingan");
    if (!userID) {
        namaEl.textContent = "Silakan Masuk";
        fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
        profilLink.href = "login.html";
        return;
    }
    const nama = localStorage.getItem("Nama");
    const foto = localStorage.getItem("Foto");
    if (nama && foto) {
        namaEl.textContent = nama;
        fotoEl.src = foto;
        profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;
    } else {
        db.ref("users").orderByChild("ID").equalTo(userID).once("value").then(snap => {
            snap.forEach(child => {
                const val = child.val();
                localStorage.setItem("Nama", val.Nama || "Tanpa Nama");
                localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");
                namaEl.textContent = val.Nama || "Tanpa Nama";
                fotoEl.src = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
                profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;
            });
        });
    }
    document.getElementById("cariUser").addEventListener("input", function() {
        const k = this.value.trim().toLowerCase();
        hasilUserEl.innerHTML = "";
        if (k.length < 2) return;
        db.ref("users").orderByChild("NamaLower").startAt(k).endAt(k + "\uf8ff").limitToFirst(20).once("value").then(snap => {
            snap.forEach(child => {
                const v = child.val();
                const d = document.createElement("div");
                d.innerHTML = `<div style="display:flex; align-items:center; gap:8px; background:#fff; padding:8px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1)"><img src="${v.Foto || "https://nasukafoods.site/gambarkosong.jpg"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover" /><div style="flex:1"><b>${v.Nama || "Tanpa Nama"}</b><br /><a href="profil.html?id=${encodeURIComponent(v.ID)}" style="font-size:12px; color:#2196F3">Lihat Profil</a></div></div>`;
                hasilUserEl.appendChild(d);
            });
        });
    });
    function getUserData(uid) {
        return new Promise(resolve => {
            if (userCache[uid]) return resolve(userCache[uid]);
            db.ref("users").orderByChild("ID").equalTo(uid).once("value").then(snap => {
                let nama = "Tanpa Nama";
                snap.forEach(u => {
                    if (u.val().Nama) nama = u.val().Nama;
                });
                userCache[uid] = nama;
                resolve(nama);
            });
        });
    }
    const userChatsRef = db.ref(`users/${userID}/chats`);
    userChatsRef.on('value', snapshot => {
        const chats = snapshot.val() || {};
        let unreadCount = 0;
        for (const key in chats) {
            if (chats[key].read === false || chats[key].read === undefined) {
                if (chats[key].ID !== userID) {
                    unreadCount++;
                }
            }
        }
        if (unreadCount > 0) {
            notifInbox.style.display = 'inline-block';
            notifInbox.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
            notifInbox.style.display = 'none';
            notifInbox.textContent = '';
        }
    });
    notifInbox.onclick = () => {
        db.ref(`users/${userID}/chats`).once('value').then(async snapshot => {
            const chats = snapshot.val() || {};
            if (Object.keys(chats).length === 0) {
                alert('Tidak ada pengirim pesan');
                return;
            }
            const pengirimData = [];
            for (const chatID of Object.keys(chats)) {
                const userSnap = await db.ref('users').orderByChild('ID').equalTo(chatID).once('value');
                userSnap.forEach(u => {
                    const nama = u.val().Nama || 'Pengguna';
                    pengirimData.push({ id: chatID, nama });
                });
            }
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.background = '#fff';
            container.style.border = '1px solid #ccc';
            container.style.borderRadius = '8px';
            container.style.padding = '12px';
            container.style.zIndex = '9999';
            container.style.maxHeight = '300px';
            container.style.overflowY = 'auto';
            container.style.minWidth = '200px';
            container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '❌';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '6px';
            closeBtn.style.right = '6px';
            closeBtn.style.background = 'transparent';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '18px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => {
                document.body.removeChild(container);
            };
            container.appendChild(closeBtn);
            pengirimData.forEach(({ id, nama }) => {
                const btn = document.createElement('button');
                btn.textContent = nama;
                btn.style.display = 'block';
                btn.style.width = '100%';
                btn.style.margin = '6px 0';
                btn.style.padding = '8px';
                btn.style.border = 'none';
                btn.style.borderRadius = '4px';
                btn.style.background = '#2196F3';
                btn.style.color = '#fff';
                btn.style.cursor = 'pointer';
                btn.onclick = () => {
                    document.body.removeChild(container);
                    window.location.href = `inbox.html?id=${encodeURIComponent(id)}`;
                };
                container.appendChild(btn);
            });
            document.body.appendChild(container);
        });
    };
    db.ref("posts").orderByChild("Status").equalTo("publik").limitToLast(20).on("child_added", async postSnap => {
        const post = postSnap.val();
        const postId = postSnap.key;
        const namaPemilik = await getUserData(post.ID);
        const div = document.createElement("div");
        div.className = "post-item";
        div.style.flexDirection = "column";
        div.innerHTML = `<div style="text-align:center; font-weight:bold; font-size:14px; margin-bottom:6px">${namaPemilik}</div>${post.Foto ? `<img src="${post.Foto}" class="foto-post" style="width:100px; height:100px; margin:0 auto 8px; display:block; border-radius:8px; object-fit:cover; cursor:pointer" onclick="tampilkanGambarPenuh('${post.Foto}')" />` : ``}<div style="font-size:13px; margin:4px 0"><b>${(post.Judul || "").replace(/\n/g, "<br>")}</b></div><div style="font-size:11px; color:gray">${post.Waktu ? new Date(post.Waktu).toLocaleString("id-ID") : ""}</div><div style="display:flex; align-items:center; gap:8px; margin-top:8px"><button onclick="toggleLike('${postId}')" id="likeBtn-${postId}" style="padding:6px 10px; border:none; border-radius:6px; cursor:pointer; font-size:13px">❤️</button><span id="likeCount-${postId}" style="font-size:13px">0 suka</span></div><div id="komentar-${postId}" style="margin-top:10px; display:none;"></div><button id="lihatKomentarBtn-${postId}" style="margin-top:6px; padding:6px 10px; background:red; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px">Lihat Komentar</button><div style="display:flex; gap:6px; margin-top:6px"><textarea id="inputKomentar-${postId}" placeholder="Tulis komentar..." style="flex:1; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:13px; resize:none" rows="1"></textarea><button onclick="kirimKomentar('${postId}')" style="padding:6px 10px; background:#2196F3; color:white; border:none; border-radius:6px; font-size:13px">Ok</button></div>`;
        daftar.prepend(div);
        db.ref("likes/" + postId).on("value", snap => {
            document.getElementById("likeCount-" + postId).textContent = `${snap.numChildren()} suka`;
            const likeBtn = document.getElementById("likeBtn-" + postId);
            if (likeBtn) {
                if (snap.hasChild(userID)) {
                    likeBtn.textContent = "❤️";
                    likeBtn.style.background = "#f8d7da";
                } else {
                    likeBtn.textContent = "💔";
                    likeBtn.style.background = "#eee";
                }
            }
        });
        let komentarLoaded = false;
        const btnLihat = div.querySelector(`#lihatKomentarBtn-${postId}`);
        const wadahKomentar = div.querySelector(`#komentar-${postId}`);
        btnLihat.onclick = () => {
            if (wadahKomentar.style.display === "none") {
                wadahKomentar.style.display = "block";
                btnLihat.textContent = "Sembunyikan Komentar";
                if (!komentarLoaded) {
                    db.ref("komentar/" + postId).on("value", snap => {
                        wadahKomentar.innerHTML = "";
                        snap.forEach(c => {
                            const v = c.val();
                            const d = document.createElement("div");
                            d.style = "background:#f9f9f9; padding:6px; margin-top:4px; border-radius:6px; font-size:12px";
                            d.innerHTML = `<b>${v.Nama || "Anonim"}</b>: ${(v.Teks || "").replace(/\n/g, "<br>")}`;
                            wadahKomentar.appendChild(d);
                        });
                    });
                    komentarLoaded = true;
                }
            } else {
                wadahKomentar.style.display = "none";
                btnLihat.textContent = "Lihat Komentar";
            }
        };
    });
    window.kirimKomentar = function(postId) {
        if (!userID) return alert("Silakan login dulu untuk komentar");
        const nama = localStorage.getItem("Nama") || "Anonim";
        const input = document.getElementById("inputKomentar-" + postId);
        const teks = (input?.value || "").trim();
        if (!teks) return;
        db.ref("komentar/" + postId).push({ ID: userID, Nama: nama, Teks: teks, Waktu: new Date().toISOString() });
        input.value = "";
    };
    window.toggleLike = function(postId) {
        if (!userID) return alert("Silakan login dulu untuk like");
        const refLike = db.ref("likes/" + postId + "/" + userID);
        refLike.once("value").then(snap => {
            if (snap.exists()) {
                refLike.remove();
            } else {
                refLike.set(true);
            }
        });
    };
    window.tampilkanGambarPenuh = function(src) {
        if (!src) return;
        const modal = document.getElementById("modalGambar");
        const gambar = document.getElementById("gambarModal");
        gambar.src = src;
        modal.style.display = "flex";
    };
    document.getElementById("modalGambar").addEventListener("click", () => {
        document.getElementById("modalGambar").style.display = "none";
    });
});

