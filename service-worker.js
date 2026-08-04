// SanPOS PWA Service Worker
// เปลี่ยนเลข CACHE_NAME (v1 -> v2 -> ...) ทุกครั้งที่แก้ไข index.html แล้วต้องการให้ผู้ใช้ได้ไฟล์ใหม่
const CACHE_NAME = 'sanpos-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ติดตั้ง: ดาวน์โหลดไฟล์หลักเก็บไว้ในเครื่อง
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// เปิดใช้งาน: ลบแคชเวอร์ชันเก่าทิ้ง
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ดักจับทุก request: ถ้ามีเน็ตให้ใช้ของใหม่ + อัปเดตแคช, ถ้าไม่มีเน็ตให้ใช้ของที่แคชไว้
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
