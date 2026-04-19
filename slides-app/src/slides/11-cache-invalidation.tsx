import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `const cache = new Map();

function GetUser(id) {
  if (cache.has(id)) return cache.get(id);
  const u = db.fetch(id);
  cache.set(id, u);
  return u;
}
// UpdateUser never clears cache → stale forever`;

const AFTER = `const cache = new TTLCache({ ttl: 60_000 });

function GetUser(id) {
  return cache.get(id) ?? cache.set(id, db.fetch(id));
}

function UpdateUser(id, patch) {
  db.update(id, patch);
  cache.delete(id);  // ← invalidate
}`;

export default function CacheInvalidationSlide() {
  return (
    <SlideLayout
      eyebrow="Architecture"
      title="Caches must invalidate on mutation"
      subtitle="Every cache has an explicit TTL AND an invalidation hook on the related mutation. No hidden state."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ Stale forever"
        afterLabel="✅ TTL + invalidation"
      />
    </SlideLayout>
  );
}
