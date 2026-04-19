import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `try {
  await charge(order);
} catch (err) {
  throw err;
  // → "Error: ECONNREFUSED" — no idea where it came from
}`;

const AFTER = `try {
  await charge(order);
} catch (err) {
  throw AppError.wrap(err, 'PaymentService.Charge', { OrderId });
  // → { Code, File, Line, Message, Cause, OrderId }
}`;

export default function AppErrorWrapperSlide() {
  return (
    <SlideLayout
      eyebrow="Errors"
      title="Wrap every error with file:line context"
      subtitle="Raw throw loses the trail. AppError.wrap preserves the cause and pins the failure to a code location."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ Naked re-throw"
        afterLabel="✅ Wrapped with context"
      />
    </SlideLayout>
  );
}
