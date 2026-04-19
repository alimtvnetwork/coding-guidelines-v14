import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `if (!isInvalid(input) && !isMissing(token)) {
  proceed();
}
// double-negation — readers must mentally flip every check`;

const AFTER = `if (IsValid(input) && IsPresent(token)) {
  proceed();
}
// reads naturally — every check states what we want`;

export default function PositivelyNamedGuardsSlide() {
  return (
    <SlideLayout
      eyebrow="Naming"
      title="Negate the variable, not the function"
      subtitle="Always name guards for the positive condition. Let the call site decide whether to negate."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ Double-negation"
        afterLabel="✅ Positive guard"
      />
    </SlideLayout>
  );
}
