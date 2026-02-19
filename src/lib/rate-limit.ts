// 簡易インメモリレートリミッター（サーバー再起動でリセット）

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// 期限切れエントリを定期的にクリーンアップ
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) {
      store.delete(key);
    }
  }
}

// 5分ごとにクリーンアップ
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000);
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return {
    check(ip: string): { allowed: boolean; remaining: number } {
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now >= entry.resetTime) {
        // 新しいウィンドウを開始
        store.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
      }

      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count };
    },
  };
}
