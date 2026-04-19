import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `const active = true;
const items = order.items.length > 0;
function valid(x) {
  return x != null;
}`;

const AFTER = `const IsActive = true;
const HasItems = order.items.length > 0;
function IsValid(x) {
  return x != null;
}`;

export default function BooleanPrefixesSlide() {
  return (
    <SlideLayout
      eyebrow="Naming"
      title="Booleans tell the truth"
      subtitle="Boolean variables and predicates start with Is, Has, Can, or Should."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ Ambiguous"
        afterLabel="✅ Self-describing"
      />
    </SlideLayout>
  );
}
