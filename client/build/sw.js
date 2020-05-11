const CACHE_NAME = 'winds-score-cache-20180927001'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache.map(function(urlsToCache) {
          return new Request(urlsToCache, { mode: 'no-cors' })
        })).then(function() {
          // console.log('All resources have been fetched and cached.')
        })
      })
  )
})
self.addEventListener('fetch', event => {
  if (event.request.url.match(/\.mp3$/)) return
  if (event.request.url.match(/\.mp4$/)) return
  if (event.request.method === 'POST') return
  event.respondWith(
    caches.match(event.request)
      .then((res) => {
        // キャッシュがあった場合
        if (res) {
          // console.log('[sw] has cache')
          return res
        }
        // キャッシュがなかったのでリクエストを clone する
        const fetchRequest = event.request.clone()

        return fetch(event.request)
          .then((res) => {
            // レスポンスが正しいかを確認
            if (!res || res.status !== 200 || res.type !== 'basic') return res

            // レスポンスは Stream でブラウザ用とキャッシュ用の2回必要なので clone する
            const responseToCache = res.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return res
          })
      })
  )
})

self.addEventListener('activate', (event) => {
  var cacheWhitelist = ['winds-score-cache-20180927001']

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})