import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `if (order.status === 'shipped') { /* ... */ }
if (order.status === 'shippped') { /* typo */ }
// silent bug — string typo never caught`;

const AFTER = `enum OrderStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
}
if (order.Status === OrderStatus.Shipped) { /* ... */ }
// compiler catches typos at build time`;

export default function MagicStringsSlide() {
  return (
    <SlideLayout
      eyebrow="Code Red"
      title="Magic strings are bugs in disguise"
      subtitle="Never compare a string literal in two places. Promote to enum or const so the compiler catches typos."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ Repeated literals"
        afterLabel="✅ Enum-checked"
      />
    </SlideLayout>
  );
}
