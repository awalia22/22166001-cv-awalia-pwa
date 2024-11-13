const CACHE_NAME = 'Portofolio-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/manifest.json',
    '/assets/img/porto 1.jpg',
    '/assets/img/profileImage.jpg',
    '/assets/img/icons/icon-192x192.png',
    '/assets/img/icons/icon-521x521.png',
    '/assets/sylesheet/app.js'
];

// Event untuk install service worker dan caching file
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Membuka cache', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(function(error){
                console.error('cache gagal dibuka', error);
            })
    );
});
// Event untuk mengaktifkan service worker dan menghapus cache lama
self.addEventListener('activate', event => {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Mengambil kontrol dari semua client tanpa reload
});
// Fetch event handler dengan strategi berbeda untuk HTML dan aset statis
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
      // Untuk file HTML, ambil dari jaringan dengan fallback ke cache
      event.respondWith(
        fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              // Hanya cache permintaan dengan skema yang didukung
              if (event.request.url.startsWith('http')) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => caches.match(event.request)) // Fallback ke cache jika jaringan gagal
      );
    } else {
      // Untuk aset statis, gunakan cache-first
      event.respondWith(
        caches.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              // Hanya cache permintaan dengan skema yang didukung
              if (event.request.url.startsWith('http')) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          });
        })
      );
    }
  });
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = 'ME Portfolio';
    const notificationOptions = {
      body: 'Halo! Selamat Datang di ME Portfolio',
      icon: 'assets/img/icons/icon-192x192.png',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });