let cacheInstance: Cache;

async function open() {
  if ('caches' in self) {
    cacheInstance = await caches.open('pid-component');
  }
}

/**
 * Fetches a resource from the cache or the network.
 * Acts as a wrapper around the Cache API and the fetch API.
 * @param url The URL of the resource to fetch.
 * @param init The options for the fetch request.
 * @returns {Promise<Response>} The response of the fetch request.
 */
export async function cachedFetch(url: string, init?: any): Promise<any> {
  await open();
  if (cacheInstance) {
    // If there is a cache available, check if the resource is cached.
    const response = await cacheInstance.match(url);
    if (response) {
      // If the resource is cached, return it.
      return response.json();
    } else {
      // If the resource is not cached, fetch it from the network, cache and return it.
      let response: Response;
      const parts = url.split('://');
      if (parts[0] !== 'https') {
        // if not https, make it https
        response = await fetch(`https://${parts[1]}`, init);
        if (!response) {
          // if https fails, try http as fallback
          console.log(`404 for https://${parts[1]} - trying http://${parts[1]}`);
          response = await fetch(`http://${parts[1]}`, init);
        }
      } else {
        // if https, use it
        response = await fetch(url, init);
      }

      // add to cache and return
      await cacheInstance.put(url, response.clone());
      return response.json();
    }
  } else {
    // If there is no cache available, fetch the resource from the network.
    const response = await fetch(url, init);
    return response.json();
  }
}

/**
 * Clears the cache.
 * @returns {Promise<void>} A promise that resolves when the cache is cleared.
 */
export async function clearCache(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.delete('pid-component');
  }
}
