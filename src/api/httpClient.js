/**
 * HTTP client tuned for Jikan v4 (https://docs.api.jikan.moe/):
 * - Rate limit: 3 requests/second and 60 requests/minute per IP → client-side throttle.
 * - 429 / 5xx → retry with exponential backoff (honors Retry-After).
 * - Jikan already caches upstream for 24h, so a client cache with TTL is safe and saves quota.
 * - Identical in-flight requests are deduplicated.
 *
 * Built as a factory so tests can inject fetch, clock, sleep and storage.
 */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const MESSAGES = {
  0: "Network error. Check your connection and try again.",
  400: "The request was not valid.",
  404: "We couldn't find that title.",
  429: "Too many requests to the anime database. Wait a few seconds and retry.",
  500: "The anime database is having trouble. Try again in a moment.",
};
const messageFor = (status) => MESSAGES[status] ?? MESSAGES[status >= 500 ? 500 : 0];

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function defaultStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; // storage disabled (privacy mode)
  }
}

export function createHttpClient({
  fetchImpl = (...args) => globalThis.fetch(...args),
  sleep = realSleep,
  now = () => Date.now(),
  storage = defaultStorage(),
  minIntervalMs = 400,
  perMinute = 55,
  timeoutMs = 10000,
  maxRetries = 2,
  defaultTtlMs = 10 * 60 * 1000,
  storagePrefix = "jikan:",
} = {}) {
  const memory = new Map();
  const inflight = new Map();
  const stamps = [];
  let slotChain = Promise.resolve();

  async function waitForSlot() {
    for (;;) {
      const t = now();
      while (stamps.length && t - stamps[0] >= 60_000) stamps.shift();
      const last = stamps.at(-1) ?? -Infinity;
      const wait = Math.max(last + minIntervalMs - t, stamps.length >= perMinute ? stamps[0] + 60_000 - t : 0);
      if (wait <= 0) {
        stamps.push(t);
        return;
      }
      await sleep(wait);
    }
  }

  // Serialize slot acquisition so concurrent callers can't race past the limit.
  function takeSlot() {
    slotChain = slotChain.then(waitForSlot);
    return slotChain;
  }

  function readCache(key) {
    const hit = memory.get(key);
    if (hit && hit.expires > now()) return hit.data;
    try {
      const raw = storage?.getItem(storagePrefix + key);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (parsed.expires > now()) {
        memory.set(key, parsed);
        return parsed.data;
      }
      storage.removeItem(storagePrefix + key);
    } catch {
      // corrupt or unavailable storage: treat as a miss
    }
    return undefined;
  }

  function writeCache(key, data, ttlMs) {
    const entry = { data, expires: now() + ttlMs };
    memory.set(key, entry);
    try {
      storage?.setItem(storagePrefix + key, JSON.stringify(entry));
    } catch {
      // quota exceeded: memory cache is enough
    }
  }

  const backoff = (attempt) => 1000 * 2 ** attempt;

  async function fetchWithRetry(url) {
    for (let attempt = 0; ; attempt++) {
      await takeSlot();
      let res;
      try {
        res = await fetchImpl(url, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        // A timeout means the API is down or overloaded: fail fast and let the user retry.
        const timedOut = err?.name === "TimeoutError";
        if (!timedOut && attempt < maxRetries) {
          await sleep(backoff(attempt));
          continue;
        }
        throw new HttpError(0, timedOut ? "The anime database is not responding right now. Try again in a minute." : messageFor(0));
      }

      if (res.ok) return res.json();

      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt < maxRetries) {
        const retryAfter = Number(res.headers?.get?.("Retry-After")) * 1000;
        await sleep(retryAfter > 0 ? retryAfter : backoff(attempt));
        continue;
      }
      throw new HttpError(res.status, messageFor(res.status));
    }
  }

  async function getJson(url, { ttlMs = defaultTtlMs } = {}) {
    const cached = readCache(url);
    if (cached !== undefined) return cached;
    if (inflight.has(url)) return inflight.get(url);

    const request = fetchWithRetry(url)
      .then((data) => {
        writeCache(url, data, ttlMs);
        return data;
      })
      .finally(() => inflight.delete(url));
    inflight.set(url, request);
    return request;
  }

  return { getJson };
}
