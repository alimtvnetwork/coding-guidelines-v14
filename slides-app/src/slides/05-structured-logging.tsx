import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `console.log(
  'failed to charge ' + orderId + ': ' + err.message
);`;

const AFTER = `logger.error('PaymentService.ChargeFailed', {
  File: __filename,
  OrderId,
  Cause: err.message,
});`;

export default function StructuredLoggingSlide() {
  return (
    <SlideLayout
      eyebrow="Errors"
      title="One line per event, fully structured"
      subtitle="Logs must be machine-readable. Always include file path, event name, and structured fields."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ String concatenation"
        afterLabel="✅ Structured event"
      />
    </SlideLayout>
  );
}
