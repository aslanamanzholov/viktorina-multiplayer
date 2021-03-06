const KEY = 'sl-nights';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(KEY)
                .then( (cache) => {
                    return cache.addAll(event.data.payload);
                })
                .catch(err => console.dir(err))
        );
    }
});

self.addEventListener('fetch',   (event) => {
    const request = event.request;
    event.respondWith(
        caches.match(request)
            .then(async (cachedResponse) => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                const url = new URL(event.request.url);

                if (navigator.onLine) {
                    return fetch(request)
                        .then(res => {
                            const resClone = res.clone();
                            if (!url.href.includes('api')) {
                                caches.open(KEY).then((cache) => cache.put(request, resClone));
                            }
                            return res;
                        })
                        .catch(err => console.error(err));
                }

                if (url.href.includes('api')) {
                    const init = {
                        status: 418,
                        statusText: 'Offline Mode'
                    };

                    const data = {message: 'Content is not available in offline mode'};
                    const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
                    return new Response(blob, init);

                } else {
                    const baseUrl = url.toString().replace(url.pathname, '/');
                    try {
                        const cache = await caches.open(KEY);
                        const keys = await cache.keys();
                        const request = keys.find(key => key.url.toString() === baseUrl);
                        return await caches.match(request);
                    } catch (e) {
                        console.dir(e);
                    }
                }
            })
            .catch((err) => {
                console.log(err.stack || err);
            })
    );
});
