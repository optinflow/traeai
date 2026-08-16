const CACHE_NAME = 'arcade-hub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/games/minesweeper/index.html',
  '/games/minesweeper/script.js',
  '/games/2048/index.html',
  '/games/2048/style/main.css',
  '/games/2048/js/application.js',
  '/games/2048/js/game_manager.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});