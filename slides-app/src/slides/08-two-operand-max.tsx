import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `if (
  user.IsActive &&
  order.HasItems &&
  payment.IsAuthorized &&
  !order.IsLocked
) { /* ship */ }`;

const AFTER = `if (CanShipOrder(user, order, payment)) { /* ship */ }

function CanShipOrder(user, order, payment) {
  if (!user.IsActive)         return false;
  if (!order.HasItems)        return false;
  if (!payment.IsAuthorized)  return false;
  return !order.IsLocked;
}`;

export default function TwoOperandMaxSlide() {
  return (
    <SlideLayout
      eyebrow="Code Red"
      title="Max 2 operands per condition"
      subtitle="Long boolean chains hide intent. Extract a positively-named helper and let it explain itself."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ 4-operand chain"
        afterLabel="✅ Named helper"
      />
    </SlideLayout>
  );
}
