const cache = new Map();

module.exports = {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    return item.data;
  },

  set(key, data, ttl = 300000) {
    cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  },
};
