import { SlideLayout } from "@/components/SlideLayout";
import { CodeDiff } from "@/components/CodeDiff";

const BEFORE = `const user_id = 1;
const URL_parser = makeParser();
type http_response = { code: number };
function get_user_data(id) { /* ... */ }`;

const AFTER = `const UserId = 1;
const URLParser = makeParser();
type HTTPResponse = { Code: number };
function GetUserData(Id) { /* ... */ }`;

export default function NamingConventionsSlide() {
  return (
    <SlideLayout
      eyebrow="Naming"
      title="PascalCase everywhere, no underscores"
      subtitle="Identifiers, DB columns, JSON keys, types — one rule. Acronyms stay fully uppercase."
    >
      <CodeDiff
        language="typescript"
        before={BEFORE}
        after={AFTER}
        beforeLabel="❌ snake_case mix"
        afterLabel="✅ PascalCase, full-caps acronyms"
      />
    </SlideLayout>
  );
}
