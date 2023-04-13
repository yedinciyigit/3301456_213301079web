'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "android-chrome-192x192.png": "972de089286c7e6e847533e7affb5692",
"android-chrome-512x512.png": "466a3e4b8b375ffa6d0bd76bcf40b706",
"apple-touch-icon.png": "30dee3063abeaf255653e36851afbf53",
"assets/AssetManifest.json": "8e66b5a4e98f2a44ad3572a0b86b7490",
"assets/assets/aycicegi.jpg": "558eac52facf5d2fe3d9fdc49c54cd61",
"assets/assets/aycicegi2.jpg": "4b0d3071458f7fa87a42099937e8f19a",
"assets/assets/aycicegi3.jpg": "7aff9794fd70e04c2a4d24204aa1b784",
"assets/assets/baslik.jpg": "c2f71446fc83f1dc5ab7e573168d2a19",
"assets/assets/hakkinda.jpg": "4bc35f96948031326c4f9989ffe74837",
"assets/assets/islah.jpg": "abbc4bd9af21736a5ce18f31881ab721",
"assets/assets/islah1.jpg": "dc2d7cd0a4235d25d03cb2213903ab81",
"assets/assets/islah2.jpg": "fcf283597ac0bd050f9b53788c553e61",
"assets/assets/koyun.jpeg": "725945242decc78e6b360f41139e76bd",
"assets/assets/koyun1.jpg": "96795a25d3f0489f15ca5c3b2d5c4f8f",
"assets/assets/koyun2.jpg": "0e757ea59f02c4f228de3f0d60eaae94",
"assets/assets/misir.png": "67cd66af28df99d6aa3c29b0caf8d1a0",
"assets/assets/misir2.jpg": "45eb4ce26a89453f7680c42675bdb0f2",
"assets/assets/misir3.jpg": "73e7827ad360eb3c572fe68d40893bb0",
"assets/assets/su.jpg": "6874faa2b5cc11cf01d11d7a14abe95d",
"assets/assets/su1.jpg": "0b1e52b850cd22debf8780548ccecfdd",
"assets/assets/su2.jpg": "f91f492007153932dc5d1faef3eb44f8",
"assets/assets/yapay1.jpg": "7513052ff2d83482d6454ab2d4d0128e",
"assets/assets/yapay2.jpg": "f6da693a98d9d98d49bcba65026b2da1",
"assets/assets/yapay3.jpg": "c15fd641fdf3a9e8a90595b65a631aac",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "19152550428fbd3b467fd0470692de11",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"favicon-16x16.png": "8c1d230883515be113ab532b9f4317c4",
"favicon-32x32.png": "e04e4234ce4c42d4eee5515ba354ef47",
"favicon.ico": "e7f1c6a1d11fc4fb71a3c5a80b2f9dee",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"index.html": "aa0ad78d0f7f059e1b043d01768ad220",
"/": "aa0ad78d0f7f059e1b043d01768ad220",
"main.dart.js": "7a8efbca8f033c584bcbb71e39e8ec18",
"site.webmanifest": "053100cb84a50d2ae7f5492f7dd7f25e",
"version.json": "60448728cfcb2eec838ed2ec58cc9dea"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
