// AreBet Service Worker — network-first with navigation fallback
const CACHE_NAME = "arebet-v1";
const OFFLINE_URL = "/";

// Assets to pre-cache on install
const PRECACHE_URLS = ["/", "/arebet-logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Push event — display the notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "AreBet";
  const body  = data.body  ?? "You have a new update.";
  const icon  = data.icon  ?? "/arebet-logo.svg";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/arebet-logo.svg",
      tag: data.tag ?? "arebet-general",
      renotify: true,
    })
  );
});

// Notification click — focus existing tab or open a new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const focused = clients.find((c) => "focus" in c);
        if (focused) return focused.focus();
        return self.clients.openWindow("/");
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests for same-origin or CDN resources
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip Next.js HMR / internal routes
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (url.pathname.startsWith("/_next/static/chunks/pages/_error")) return;

  // Navigation requests: network-first, fall back to cached "/"
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets: network-first, stale-while-revalidate style
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
