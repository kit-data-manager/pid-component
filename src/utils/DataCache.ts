/**
 * This class is a wrapper around the Cache API.
 */
export class DataCache {
  private readonly name: string;
  private cacheInstance: Cache = undefined;
  private readonly mapInstance: Map<string, any> = undefined;

  /**
   * Creates a new DataCache instance.
   * @param name The name of the cache.
   */
  constructor(name: string) {
    this.name = name;
    console.log(`Opening cache ${this.name}`);
    if ('caches' in self) {
      caches.open(this.name).then((cache) => this.cacheInstance = cache);
      console.log(`Cache ${this.name} opened`);
    } else {
      console.log(`Caching not supported in this browser. Using Map instead`);
      this.mapInstance = new Map();
    }
  }

  /**
   * Fetches a resource from the cache or the network.
   * Acts as a wrapper around the Cache API and the fetch API.
   * @param url The URL of the resource to fetch.
   * @param init The options for the fetch request.
   * @returns {Promise<Response>} The response of the fetch request.
   */
  async fetch(url: string, init?: any): Promise<Response> {
    if (this.cacheInstance) {
      const response = await this.cacheInstance.match(url);
      if (response !== undefined) return response;
      else {
        console.log(`Cache ${this.name} miss for ${url} - fetching from network`)
        const response = await fetch(url, init);
        await this.cacheInstance.put(url, response.clone());
        return response;
      }
    } else if (this.mapInstance) {
      const result = this.mapInstance.get(url);
      if (result !== undefined) return result;
      else {
        console.log(`Cache ${this.name} miss for ${url} - fetching from network`)
        const response = await fetch(url, init);
        this.mapInstance.set(url, response.clone());
        return response;
      }
    }
  }
}


