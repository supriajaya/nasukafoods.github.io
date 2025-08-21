 const form = document.getElementById('topupForm');
  const statusMessage = document.getElementById('statusMessage');
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpOktAYKx2f4hOLaTcwynZO8EghJYKpwGgMO39dr10tYZzgoUsdaLsWbjyi6AvOYiR_A/exec';

  const fileInput = document.getElementById('bukti');
  const fileNameSpan = document.getElementById('file-name');
  const transactionReceipt = document.getElementById('transactionReceipt');
  const receiptDetails = document.getElementById('receiptDetails');
  const backButton = document.getElementById('backButton');
  const printButton = document.getElementById('printButton');


  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
      fileNameSpan.style.display = 'inline';
    } else {
      fileNameSpan.textContent = '';
      fileNameSpan.style.display = 'none';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMessage.textContent = 'Loading...';
    statusMessage.className = '';

    const formData = new FormData(form);
    const buktiFile = formData.get('bukti');

    if (!buktiFile || buktiFile.size === 0) {
      statusMessage.textContent = 'Harap lampirkan bukti foto.';
      statusMessage.className = 'error';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(buktiFile);
    
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];
      
      const payload = {
        action: 'handleTopup',
        id: formData.get('id'),
        nama: formData.get('nama'),
        username: formData.get('username'),
        deposit: formData.get('deposit'),
        bukti: base64Image
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload) 
        });

        const result = await response.json();
        statusMessage.textContent = result.message;
        statusMessage.className = result.status === 'success' ? 'success' : 'error';
        
        if (result.status === 'success') {
   
          const id = formData.get('id');
          const nama = formData.get('nama');
          const username = formData.get('username');
          const deposit = formData.get('deposit');

      
          const now = new Date();
          const formattedDate = now.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

    
          receiptDetails.innerHTML = `
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Nama:</strong> ${nama}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Jumlah:</strong> Rp. ${Number(deposit).toLocaleString('id-ID')}</p>
            <p><strong>Tanggal:</strong> ${formattedDate}</p>
          `;
          
       
          form.style.display = 'none';
          transactionReceipt.style.display = 'block';
        }
      } catch (error) {
        statusMessage.textContent = 'Terjadi kesalahan saat mengirim permintaan.';
        statusMessage.className = 'error';
        console.error('Error:', error);
      }
    };
    reader.onerror = () => {
      statusMessage.textContent = 'Gagal membaca file bukti transfer.';
      statusMessage.className = 'error';
    };
  });

  document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('ID');
    const userName = localStorage.getItem('Nama');
    const userUsername = localStorage.getItem('Username');
    
    if (userId) {
      document.getElementById('id').value = userId;
    }
    if (userName) {
      document.getElementById('nama').value = userName;
    }
    if (userUsername) {
      document.getElementById('username').value = userUsername;
    }
  
  });
