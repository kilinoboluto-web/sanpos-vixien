// Service Worker ขั้นต่ำที่จำเป็นสำหรับให้เบราว์เซอร์ยอมให้ "ติดตั้งแอป" ได้
// ใช้กลยุทธ์ network-first (พยายามโหลดของใหม่จากเน็ตก่อนเสมอ ถ้าล้มเหลวค่อยใช้ของที่แคชไว้)
// เพื่อให้แอปอัปเดตทันทีที่มีโค้ดใหม่ ไม่ต้องกังวลเรื่องแคชค้างเวอร์ชันเก่า

const CACHE_NAME = 'sanpos-cache-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // ให้เวอร์ชันใหม่ทำงานทันทีไม่ต้องรอปิดแท็บเก่า
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return; // ไม่แคช POST (เช่น การส่งข้อมูลไป Google Sheets)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
