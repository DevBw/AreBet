// Service Worker for BetHelper - Offline Support and Caching
const CACHE_NAME = 'bethelper-v1.0.1';
const STATIC_CACHE = 'bethelper-static-v1.0.1';
const DYNAMIC_CACHE = 'bethelper-dynamic-v1.0.1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/tailwind.css',
  '/css/optimized-styles.css',
  '/js/modules/ui-manager.js',
  '/js/modules/data-manager.js',
  '/js/modules/validation.js',
  '/js/app-modular.js',
  '/js/config.js',
  '/js/api-service.js',
  '/js/notification-service.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticFile(request)) {
        event.respondWith(handleStaticFile(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Check if request is for a static file
function isStaticFile(request) {
    const url = new URL(request.url);
    return STATIC_FILES.includes(url.pathname) || 
           url.pathname.startsWith('/css/') ||
           url.pathname.startsWith('/js/') ||
           url.origin === 'https://cdn.jsdelivr.net';
}

// Check if request is for API
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.origin === 'https://v3.football.api-sports.io';
}

// Check if request is for an image
function isImageRequest(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
           url.hostname.includes('media.api-sports.io');
}

// Handle static file requests
async function handleStaticFile(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Static file fetch failed:', error);
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Handle API requests with stale-while-revalidate strategy
async function handleAPIRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses
            cache.put(request, networkResponse.clone());
            return networkResponse;
        } else {
            throw new Error('Network response not ok');
        }
    } catch (error) {
        console.log('API request failed, trying cache:', error);
        
        // Fallback to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return error response
        return new Response(JSON.stringify({
            error: 'API unavailable',
            message: 'Please check your internet connection'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        // Try cache first
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful image responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Image fetch failed:', error);
        
        // Return placeholder image
        return new Response('', {
            status: 404,
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

// Handle dynamic requests
async function handleDynamicRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Dynamic request failed, trying cache:', error);
        
        // Fallback to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(performBackgroundSync());
    }
});

// Perform background sync
async function performBackgroundSync() {
    try {
        // Sync any pending data
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'background-sync',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: data.tag || 'bethelper-notification',
            requireInteraction: data.requireInteraction || false,
            data: data
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window' })
            .then(clients => {
                // Focus existing window or open new one
                if (clients.length > 0) {
                    clients[0].focus();
                } else {
                    self.clients.openWindow('/');
                }
            })
    );
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'skip-waiting':
            self.skipWaiting();
            break;
            
        case 'clear-cache':
            clearCache(data.cacheName);
            break;
            
        case 'cache-url':
            cacheURL(data.url, data.cacheName);
            break;
            
        case 'get-cache-info':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;
    }
});

// Clear specific cache
async function clearCache(cacheName) {
    try {
        await caches.delete(cacheName);
        console.log('Cache cleared:', cacheName);
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}

// Cache specific URL
async function cacheURL(url, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const response = await fetch(url);
        await cache.put(url, response);
        console.log('URL cached:', url);
    } catch (error) {
        console.error('Failed to cache URL:', error);
    }
}

// Get cache information
async function getCacheInfo() {
    try {
        const cacheNames = await caches.keys();
        const cacheInfo = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = keys.length;
        }
        
        return cacheInfo;
    } catch (error) {
        console.error('Failed to get cache info:', error);
        return {};
    }
}

// Periodic cache cleanup
setInterval(async () => {
    try {
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
            if (cacheName === DYNAMIC_CACHE) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                
                // Remove old entries (older than 7 days)
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                
                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const date = response.headers.get('date');
                        if (date && new Date(date).getTime() < sevenDaysAgo) {
                            await cache.delete(request);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}, 24 * 60 * 60 * 1000); // Every 24 hours 