import { Link, useNavigate } from "react-router-dom";
import { Book, CheckCircle, Code, FileText, Shield, Zap, ArrowRight, Layers, Ban, ToggleLeft, Hash, Ruler, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const codeRedRules = [
  { rule: "No nested if statements", desc: "Flatten all conditionals — zero nesting allowed", icon: Ban, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/04-code-style/01-braces-and-nesting.md" },
  { rule: "Boolean naming: is/has prefix", desc: "Every boolean must start with is or has", icon: ToggleLeft, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles/01-naming-prefixes.md" },
  { rule: "No magic strings or numbers", desc: "Use enums or typed constants for all repeated values", icon: Hash, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/13-strict-typing.md" },
  { rule: "Max 15 lines per function", desc: "Error-handling lines exempt; extract helpers otherwise", icon: Ruler, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/04-code-style/04-function-and-type-size.md" },
  { rule: "No any in TypeScript", desc: "Use unknown at parse boundaries with immediate narrowing", icon: ShieldAlert, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/13-strict-typing.md" },
  { rule: "Result guard before access", desc: "Always check error state before using returned data", icon: ShieldCheck, docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/15-master-coding-guidelines/02-boolean-and-enum.md" },
];

const quickReference = [
  { category: "Naming", items: ["PascalCase: Components, Types, Enums, DB tables", "camelCase: functions, variables, utilities", "Abbreviations: Id, Url, Json, Api (not ID, URL)"], docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/22-variable-naming-conventions.md" },
  { category: "Booleans", items: ["Always is/has prefix", "No negative words (not, no, non)", "Max 2 operands per expression"], docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles/00-overview.md" },
  { category: "Database", items: ["PascalCase tables & columns (quoted)", "{TableName}Id INTEGER PRIMARY KEY", "Double-quoted identifiers in SQL"], docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/10-database-conventions/01-naming-conventions.md" },
  { category: "Functions", items: ["Max 3 parameters (use options object for 4+)", "Max 15 lines per body", "Max 300 lines per file"], docPath: "spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/04-code-style/04-function-and-type-size.md" },
];

const specSections = [
  { icon: Code, title: "Cross-Language Standards", desc: "29 files covering DRY, naming, booleans, typing, complexity, null safety, and more", path: "01-cross-language" },
  { icon: FileText, title: "TypeScript Standards", desc: "Enum patterns, type safety, promise/await patterns", path: "02-typescript" },
  { icon: Layers, title: "Golang Standards", desc: "Go coding standards, enum spec, boolean rules, defer, severity taxonomy", path: "03-golang" },
  { icon: Shield, title: "Security Policies", desc: "Dependency pinning, vulnerability tracking, Axios version control", path: "09-security" },
  { icon: Zap, title: "AI Optimization", desc: "Anti-hallucination rules, quick-reference checklist, common AI mistakes", path: "06-ai-optimization" },
  { icon: Book, title: "Database Conventions", desc: "Schema design, PascalCase naming, ORM usage, REST API format", path: "10-database-conventions" },
];

function HeroBadge() {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
      <CheckCircle className="h-4 w-4 text-primary" />
      v3.1.0 — Production-Ready
    </div>
  );
}

function HeroHeading() {
  return (
    <>
      <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        Coding Guidelines
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
        Consolidated coding standards across TypeScript, Go, PHP, Rust, and C#.
        One canonical source of truth — optimized for AI and human developers alike.
      </p>
    </>
  );
}

function HeroButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button asChild size="lg">
        <Link to="/docs">Browse Documentation <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link to="/checklist"><CheckCircle className="mr-2 h-4 w-4" /> Code Review Checklist</Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <a href="#quick-reference">Quick Reference</a>
      </Button>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <HeroBadge />
        <HeroHeading />
        <HeroButtons />
      </div>
    </section>
  );
}

function CodeRedCardHeader({ icon: IconComponent, rule }: { icon: typeof codeRedRules[number]["icon"]; rule: string }) {
  return (
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-base text-foreground">
        <IconComponent className="h-5 w-5 text-destructive transition-transform duration-300 group-hover:scale-125" />
        {rule}
      </CardTitle>
    </CardHeader>
  );
}

function CodeRedCard({ item }: { item: typeof codeRedRules[number] }) {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer border-destructive/20 bg-destructive/5 transition-all duration-300 hover:scale-[1.03] hover:border-destructive/50 hover:bg-destructive/10 hover:shadow-lg hover:shadow-destructive/10"
      onClick={() => navigate(`/docs?file=${encodeURIComponent(item.docPath)}`)}
    >
      <CodeRedCardHeader icon={item.icon} rule={item.rule} />
      <CardContent>
        <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">{item.desc}</p>
      </CardContent>
    </Card>
  );
}

function CodeRedSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold text-foreground">Code-Red Rules</h2>
        <p className="text-muted-foreground">Auto PR reject — these are non-negotiable</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {codeRedRules.map((item) => <CodeRedCard key={item.rule} item={item} />)}
      </div>
    </section>
  );
}

function ReferenceItem({ item }: { item: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span>{item}</span>
    </li>
  );
}

function QuickReferenceCard({ section }: { section: typeof quickReference[number] }) {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      onClick={() => navigate(`/docs?file=${encodeURIComponent(section.docPath)}`)}
    >
      <CardHeader>
        <CardTitle className="text-lg transition-colors duration-300 group-hover:text-primary">{section.category}</CardTitle>
      </CardHeader>
      <QuickReferenceCardContent items={section.items} />
    </Card>
  );
}

function QuickReferenceCardContent({ items }: { items: string[] }) {
  return (
    <CardContent>
      <ul className="space-y-2">
        {items.map((item) => <ReferenceItem key={item} item={item} />)}
      </ul>
    </CardContent>
  );
}

function QuickReferenceSection() {
  return (
    <section id="quick-reference" className="border-y border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">Quick Reference</h2>
          <p className="text-muted-foreground">Essential conventions at a glance</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {quickReference.map((s) => <QuickReferenceCard key={s.category} section={s} />)}
        </div>
      </div>
    </section>
  );
}

function SpecSectionCard({ section }: { section: typeof specSections[number] }) {
  return (
    <Link to="/docs" className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <section.icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{section.title}</CardTitle>
          <CardDescription>{section.desc}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function SpecSectionsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold text-foreground">Detailed Specs</h2>
        <p className="text-muted-foreground">Dive into category-specific standards</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {specSections.map((s) => <SpecSectionCard key={s.path} section={s} />)}
      </div>
    </section>
  );
}

const STATS = [
  { value: "88+", label: "Spec Files" },
  { value: "64", label: "AI Checks" },
  { value: "5", label: "Languages" },
  { value: "100/100", label: "Health Score" },
];

function StatsSection() {
  return (
    <section className="border-t border-border bg-secondary/30 py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold text-primary">{stat.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <CodeRedSection />
      <QuickReferenceSection />
      <SpecSectionsGrid />
      <StatsSection />
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground space-y-1">
        <p>
          Built by{" "}
          <a href="https://alimkarim.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Md. Alim Ul Karim</a>
          {" "}— Chief Software Engineer,{" "}
          <a href="https://riseup-asia.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Riseup Asia LLC</a>
        </p>
        <p className="text-xs">Coding Guidelines v3.1.0 — Last updated 2026-04-16</p>
      </footer>
    </div>
  );
};

export default LandingPage;
