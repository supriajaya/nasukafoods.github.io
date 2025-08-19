const firebaseConfig = {
  apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
  authDomain: "nasuka-fc780.firebaseapp.com",
  databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nasuka-fc780",
  messagingSenderId: "860641747257",
  appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};
firebase.initializeApp(firebaseConfig);

const pageInitializers = {};

async function navigateTo(page) {
  try {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    
    document.querySelectorAll('.page-style').forEach(style => style.remove());

    const html = await fetch(`content/${page}.html`).then(res => res.text());
    mainContent.innerHTML = html;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `css/${page}.css`;
    link.classList.add('page-style');
    document.head.appendChild(link);

    if (pageInitializers[page]) {
      pageInitializers[page]();
    } else {
      const script = document.createElement('script');
      script.src = `js/${page}.js`;
      script.onload = () => {
        if (pageInitializers[page]) {
          pageInitializers[page]();
        }
      };
      document.body.appendChild(script);
    }

  } catch (error) {
    console.error('Navigasi gagal:', error);
  }
}

window.navigateTo = navigateTo;
window.pageInitializers = pageInitializers;

document.addEventListener('DOMContentLoaded', () => {
  const initialPage = window.location.hash.substring(1) || 'home';
  navigateTo(initialPage);
});
