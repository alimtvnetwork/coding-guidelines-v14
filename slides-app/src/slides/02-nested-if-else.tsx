import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `function processOrder(order) {
  if (order) {
    if (order.user) {
      if (order.user.isActive) {
        if (order.items.length > 0) {
          return charge(order);
        }
      }
    }
  }
  return null;
}`;

const AFTER = `function processOrder(order) {
  if (!IsValidOrder(order)) return null;
  if (!HasActiveUser(order)) return null;
  if (!HasItems(order))      return null;
  return charge(order);
}`;

export default function NestedIfElseSlide() {
  return (
    <SlideLayout
      eyebrow="Code Red"
      title="Pyramid logic → guard clauses"
      subtitle="Never nest if-statements. Each precondition gets its own positively-named guard returning early."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ 4-level pyramid"
        afterLabel="✅ Flat guard clauses"
        layout="stacked"
      />
    </SlideLayout>
  );
}
