function playKawasakiVideo() {
      const videoPopup = document.getElementById('videoPopup');
      const popupVideo = document.getElementById('popupVideo');
      
      // Tampilkan popup
      videoPopup.style.display = 'flex';
      
      
      popupVideo.play();
      
      // Event listener untuk tombol close
      document.querySelector('.close-video').onclick = function() {
        videoPopup.style.display = 'none';
        popupVideo.pause();
      };
      
      // Tutup popup ketika mengklik di luar video
      videoPopup.onclick = function(e) {
        if (e.target === videoPopup) {
          videoPopup.style.display = 'none';
          popupVideo.pause();
        }
      };
    }
    
    
