const cache = new Map()

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
  }

  async get(key) {
    // This could be stored anywhere, like durable storage
    return cache.get(key)
  }

  async set(key, data, ctx) {
    // This could be stored anywhere, like durable storage
    const tags = ctx && ctx.tags ? ctx.tags : [];
    console.log(`Setting cache for ${key} with tags:`, ctx);
    
    cache.set(key, {
      value: data,
      lastModified: Date.now(),
      tags: tags,
    })
  }

  async revalidateTag(tagsToRevalidate) {
    console.log('revalidateTag', tagsToRevalidate)
    console.log('cache keys', cache.toJSON())
    // console.log('cache', cache)
    // tags is either a string or an array of strings
    tagsToRevalidate = [tagsToRevalidate].flat()
    // Iterate over all entries in the cache
    for (let [key, value] of cache) {
      // Get the cache tags safely, defaulting to an empty array if undefined
      const cacheTags = value && value.tags ? value.tags : []
      // If the value's tags include the specified tag, delete this entry
      if (tagsToRevalidate.some((tag) => cacheTags.includes(tag))) {
        cache.delete(key)
      }
    }
  }

  async delete(key) {
    cache.delete(key)
  }


  // If you want to have temporary in memory cache for a single request that is reset
  // before the next request you can leverage this method
  resetRequestCache() { }
}