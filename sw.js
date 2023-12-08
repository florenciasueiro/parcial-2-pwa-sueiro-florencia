const CACHE_NAME = 'my-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all([
        '/',
        '/index.html',
        '/manifest.json',
        '/styles.css',
        '/images/warning.png',
        'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
        '/main.js'
      ].map(url => cache.add(url)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  const apiUrl = 'https://rickandmortyapi.com/api/character/?status=alive';

  if (event.request.url === apiUrl) {
    event.respondWith(fetchApiData(event.request));
    return;
  }

  // Intentar obtener la respuesta desde la caché
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetchWithErrorHandling(event.request);
    })
  );
});

function fetchApiData(request) {
  return fetch(request)
    .then((response) => {
      // Clonar la respuesta para almacenarla en caché
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
      return response;
    })
    .catch((error) => {
      console.error('Error fetching API data:', error);
      return caches.match(request);
    });
}

function fetchWithErrorHandling(request) {
  return fetch(request)
    .then(response => {
      if (!response.ok) {
        // Enviar mensaje a la ventana principal si la respuesta no es exitosa
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              command: 'show-error-message',
              message: 'Hubo un problema al cargar la página.'
            });
          });
        });
        // Considera si realmente necesitas lanzar esta excepción
        // throw new Error('Response not OK');
      }
      return response;
    })
    .catch(() => {
      // Enviar mensaje a la ventana principal en caso de error de red
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            command: 'show-error-message',
            message: 'Error de red. Verifica tu conexión a internet.'
          });
        });
      });
      // Puedes personalizar más este manejo de errores según tus necesidades
      throw new Error('Error de red');
    });
}

self.addEventListener('fetch-api-data', (event) => {
  // Este evento se activa cuando los datos de la API están precargados
  event.respondWith(
    fetchApiData(new Request('https://rickandmortyapi.com/api/character/?status=alive'))
  );
});

// Notificar a la aplicación cuando los datos de la API están precargados
self.addEventListener('message', (event) => {
  if (event.data && event.data.command === 'api-data-preloaded') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          command: 'api-data-preloaded',
          url: event.data.url
        });
      });
    });
  }
});

// Otro bloque de código
caches.keys().then((cacheNames) => {
  console.log("Caches:", cacheNames);
});

// Tu otro bloque de código aquí...

// Puedes eliminar el último bloque de código si no es necesario

self.addEventListener("install", (event) => {
  console.log("Install");
  const cache = caches.open("mi-cache-2").then((cache) => {
    cache.addAll([
      '/',
      '/images/warning.png',
      'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
      '/main.js'
    ]);
  });
  event.waitUntil(cache);
});

self.addEventListener("fetch-cache-only", (event) => {
  const url = event.request.url;
  console.log(url);

  const cacheResponse = caches.match(event.request);

  event.respondWith(cacheResponse);
});

self.addEventListener("fetch-and-network", (event) => {
  const url = event.request.url;
  console.log(url);

  const cacheResponse = caches.match(event.request).then(response => {
    if (!response) {
      return fetch(event.request);
    }
    return response;
  });

  event.respondWith(cacheResponse);
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  console.log(url);
  const response = fetchWithErrorHandling(event.request);
  event.respondWith(response);
});
