/**
 * ToDoMon v6.0 - Service worker
 * - Precarga el "app shell" (funciona sin conexión).
 * - Navegación: red primero, caché si no hay conexión.
 * - Archivos propios: caché y revalidación en segundo plano.
 * - Sprites/gritos de raw.githubusercontent.com: caché primero (los sprites ya vistos funcionan offline).
 * - PokeAPI y Google Fonts: caché y revalidación.
 * Rutas relativas para funcionar en GitHub Pages bajo /Poke-ToDo-List-5gen/.
 */
'use strict';

const VERSION = 'v6.0.0';
const SHELL_CACHE = 'todomon-shell-' + VERSION;
const RUNTIME_CACHE = 'todomon-runtime-v1';
const RUNTIME_MAX = 400;

const SHELL = [
    './',
    './index.html',
    './css/style.css?v=6.0',
    './css/habitat-style.css?v=6.0',
    './js/data.js?v=6.0',
    './js/store.js?v=6.0',
    './js/sprites.js?v=6.0',
    './js/habitat.js?v=6.0',
    './js/app.js?v=6.0',
    './manifest.webmanifest',
    './favicon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(SHELL_CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k.startsWith('todomon-shell-') && k !== SHELL_CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }));
});

function trimRuntime() {
    return caches.open(RUNTIME_CACHE).then(function (cache) {
        return cache.keys().then(function (keys) {
            if (keys.length <= RUNTIME_MAX) return;
            return Promise.all(keys.slice(0, keys.length - RUNTIME_MAX).map(function (k) { return cache.delete(k); }));
        });
    });
}

// Una respuesta opaca (de <img>/<link> sin CORS) no sirve para un fetch() con CORS
function usable(hit, request) {
    return hit && !(hit.type === 'opaque' && request.mode === 'cors') ? hit : null;
}

function cacheFirst(request) {
    return caches.open(RUNTIME_CACHE).then(function (cache) {
        return cache.match(request).then(function (cached) {
            const hit = usable(cached, request);
            if (hit) return hit;
            return fetch(request).then(function (res) {
                if (res.ok || res.type === 'opaque') { cache.put(request, res.clone()); trimRuntime(); }
                return res;
            });
        });
    });
}

function staleWhileRevalidate(request, cacheName, opts) {
    return caches.open(cacheName).then(function (cache) {
        return cache.match(request, opts).then(function (cached) {
            const hit = usable(cached, request);
            const network = fetch(request).then(function (res) {
                if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
                return res;
            }).catch(function () { return hit || Response.error(); });
            return hit || network;
        });
    });
}

self.addEventListener('fetch', function (event) {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    if (req.mode === 'navigate') {
        event.respondWith(fetch(req).then(function (res) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then(function (c) { c.put('./index.html', copy); });
            return res;
        }).catch(function () {
            return caches.match('./index.html', { ignoreSearch: true }).then(function (r) { return r || caches.match('./'); });
        }));
        return;
    }
    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
        return;
    }
    if (url.hostname === 'raw.githubusercontent.com') {
        event.respondWith(cacheFirst(req));
        return;
    }
    if (url.hostname === 'pokeapi.co' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    }
});

// Al tocar una notificación, enfocar la app (o abrirla)
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
        for (let i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
        return self.clients.openWindow('./#tareas');
    }));
});
