document.addEventListener("scroll", () => {
  const navbar = document.querySelector(".nav");

  if (window.scrollY >= 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
      console.error('Service Worker registration failed:', error);
  });
}
if (!window.indexedDB) {
  console.log('indexedDB is not supported');
} else {
  const dbPromise = indexedDB.open('kontak', 1);

  dbPromise.onupgradeneeded = function(event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore('kontak', {
      keyPath: 'id',
      autoIncrement: true
    });
  };

  dbPromise.onsuccess = function(event) {
    const db = event.target.result;

    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function(e) {
      e.preventDefault(); // Mencegah submit default

      const transaction = db.transaction('kontak', 'readwrite');
      const objectStore = transaction.objectStore('kontak');

      const name = document.querySelector('input[name="name"]').value.trim();
      const email = document.querySelector('input[name="email"]').value.trim();
      const phone = document.querySelector('input[name="phone"]').value.trim();
      const subject = document.querySelector('input[name="subject"]').value.trim();
      const message = document.querySelector('textarea[name="message"]').value.trim();

      // Pastikan tidak ada field yang kosong
      if (name && email && phone && subject && message) {
        const pesan = {
          name,
          email,
          phone,
          subject,
          message
        };

        objectStore.add(pesan);

        transaction.oncomplete = function() {
          console.log('Pesan berhasil ditambahkan');
          form.reset(); // Mengosongkan form setelah berhasil
        };

        transaction.onerror = function() {
          console.error('Error saat menambahkan pesan');
        };
      } else {
        console.error('Semua field harus terisi dengan benar');
      }
    });
  };
}