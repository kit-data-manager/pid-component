/**
 * This class is a wrapper around the Cache API.
 */
export class DataCache {
  private readonly name: string;
  private cacheInstance: Cache = undefined;
  private readonly mapInstance: Map<string, any> = undefined;
  private unresolvables: Set<string> = new Set();

  /**
   * Creates a new DataCache instance.
   * @param name The name of the cache.
   */
  constructor(name: string) {
    this.name = name;
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
   * @returns {Promise<Response>} The response of the fetch request.
   */
  async fetch(url: string): Promise<Response> {
    if (this.unresolvables.has(url)) throw new Error(`Failed to fetch ${url}`);
    if (this.cacheInstance) {
      const response = await this.cacheInstance.match(url);
      if (response !== undefined) return response;
      else {
        const response = await this.getResponse(url);
        if (response !== undefined) await this.cacheInstance.put(url, response.clone());
        return response;
      }
    } else if (this.mapInstance) {
      const result = this.mapInstance.get(url);
      if (result !== undefined) return result;
      else {
        const response = await this.getResponse(url);
        if (response !== undefined) this.mapInstance.set(url, response.clone());
        return response;
      }
    }
  }


  private async getResponse(url: string): Promise<Response> | undefined {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      }
    });
    if (response.status >= 300) {
      this.unresolvables.add(url);
      return undefined;
    }
    return response;
  }
}

export const dataCache = new DataCache("pid-component");
