import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Filter, RotateCcw, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { categories, type CheckCategory, type CheckItem } from "@/data/checklistCategories";
import { FilterModeType, LanguageFilterType, type FilterMode, type LanguageFilter } from "@/constants/enums";

const languageLabels: Record<LanguageFilter, string> = {
  all: "All Languages",
  go: "Go",
  php: "PHP",
  typescript: "TypeScript",
  csharp: "C#",
};

function useToggleSet() {
  const [items, setItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setItems((prev) => {
      const next = new Set(prev);

      if (next.has(id)) { next.delete(id); } else { next.add(id); }

      return next;
    });
  };

  const reset = () => setItems(new Set());

  return { items, toggle, reset };
}

function useChecklistState() {
  const checked = useToggleSet();
  const collapsed = useToggleSet();
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterModeType.All);
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(LanguageFilterType.All);

  return { checked, collapsed, filterMode, setFilterMode, languageFilter, setLanguageFilter };
}

function useFilteredCategories(filterMode: FilterMode, languageFilter: LanguageFilter, checkedItems: Set<string>) {
  return useMemo(() => {
    return categories
      .filter((cat) => languageFilter === LanguageFilterType.All || !cat.language || cat.language === languageFilter)
      .map((cat) => {
        const filtered = filterMode === FilterModeType.CodeRed
          ? cat.items.filter((i) => i.isCodeRed)
          : filterMode === FilterModeType.Unchecked
          ? cat.items.filter((i) => !checkedItems.has(i.id))
          : cat.items;

        return { ...cat, items: filtered };
      })
      .filter((cat) => cat.items.length > 0);
  }, [filterMode, languageFilter, checkedItems]);
}

function HeaderTitle() {
  return (
    <div>
      <h1 className="text-lg font-bold text-foreground">Code Review Checklist</h1>
      <p className="text-xs text-muted-foreground">72 checks · Pre-output validation</p>
    </div>
  );
}

function HeaderNav({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <HeaderTitle />
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
      </Button>
    </div>
  );
}

function ChecklistHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <HeaderNav onReset={onReset} />
    </header>
  );
}

function ProgressStats({ checkedCount, totalCount }: { checkedCount: number; totalCount: number }) {
  const isAllPassed = checkedCount === totalCount;

  return (
    <div className="flex items-center gap-4">
      <div>
        <span className="text-2xl font-bold text-foreground">{checkedCount}</span>
        <span className="text-muted-foreground">/{totalCount}</span>
      </div>
      {isAllPassed && <Badge className="bg-success text-success-foreground">All Passed ✓</Badge>}
    </div>
  );
}

function CodeRedStatus({ codeRedChecked, codeRedTotal }: { codeRedChecked: number; codeRedTotal: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Shield className="h-4 w-4 text-destructive" />
      <span className="text-muted-foreground">Code-Red: {codeRedChecked}/{codeRedTotal}</span>
    </div>
  );
}

function ProgressCard({ checkedCount, totalCount, codeRedChecked, codeRedTotal }: { checkedCount: number; totalCount: number; codeRedChecked: number; codeRedTotal: number }) {
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <ProgressStats checkedCount={checkedCount} totalCount={totalCount} />
          <CodeRedStatus codeRedChecked={codeRedChecked} codeRedTotal={codeRedTotal} />
        </div>
        <Progress value={progressPercent} className="h-2" />
      </CardContent>
    </Card>
  );
}

function FilterModeButtons({ filterMode, setFilterMode }: { filterMode: FilterMode; setFilterMode: (m: FilterMode) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border p-1">
      {([FilterModeType.All, FilterModeType.CodeRed, FilterModeType.Unchecked] as FilterMode[]).map((mode) => (
        <Button key={mode} variant={filterMode === mode ? "default" : "ghost"} size="sm" onClick={() => setFilterMode(mode)} className="text-xs">
          {mode === FilterModeType.All && "All"}
          {mode === FilterModeType.CodeRed && "🔴 Code-Red Only"}
          {mode === FilterModeType.Unchecked && "Unchecked"}
        </Button>
      ))}
    </div>
  );
}

function LanguageButtons({ languageFilter, setLanguageFilter }: { languageFilter: LanguageFilter; setLanguageFilter: (l: LanguageFilter) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border p-1">
      {(Object.keys(languageLabels) as LanguageFilter[]).map((lang) => (
        <Button key={lang} variant={languageFilter === lang ? "default" : "ghost"} size="sm" onClick={() => setLanguageFilter(lang)} className="text-xs">
          {languageLabels[lang]}
        </Button>
      ))}
    </div>
  );
}

function FilterBar({ filterMode, setFilterMode, languageFilter, setLanguageFilter }: { filterMode: FilterMode; setFilterMode: (m: FilterMode) => void; languageFilter: LanguageFilter; setLanguageFilter: (l: LanguageFilter) => void }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <FilterModeButtons filterMode={filterMode} setFilterMode={setFilterMode} />
      <LanguageButtons languageFilter={languageFilter} setLanguageFilter={setLanguageFilter} />
    </div>
  );
}

function ChecklistItemRow({ item, isChecked, onToggle }: { item: CheckItem; isChecked: boolean; onToggle: () => void }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-accent/50 ${isChecked ? "opacity-60" : ""}`}>
      <Checkbox checked={isChecked} onCheckedChange={onToggle} className="mt-0.5" />
      <span className={`text-sm leading-relaxed ${isChecked ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {item.isCodeRed && (
          <span className="mr-1.5 inline-block rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">CODE RED</span>
        )}
        {item.label}
      </span>
    </label>
  );
}

function CategoryCardHeader({ cat, isCollapsed, catCheckedCount, isComplete }: { cat: CheckCategory; isCollapsed: boolean; catCheckedCount: number; isComplete: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        <CardTitle className="text-base">{cat.name}</CardTitle>
        {cat.language && <Badge variant="secondary" className="text-xs">{languageLabels[cat.language as LanguageFilter] ?? cat.language}</Badge>}
      </div>
      <div className="flex items-center gap-2">
        {isComplete && <CheckCircle className="h-4 w-4 text-success" />}
        <span className="text-sm text-muted-foreground">{catCheckedCount}/{cat.items.length}</span>
      </div>
    </div>
  );
}

function CategoryCardBody({ cat, checkedItems, onToggleItem }: { cat: CheckCategory; checkedItems: Set<string>; onToggleItem: (id: string) => void }) {
  return (
    <CardContent className="pt-0">
      <div className="space-y-3">
        {cat.items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} isChecked={checkedItems.has(item.id)} onToggle={() => onToggleItem(item.id)} />
        ))}
      </div>
    </CardContent>
  );
}

function CategoryCard({ cat, isCollapsed, checkedItems, onToggleCategory, onToggleItem }: { cat: CheckCategory; isCollapsed: boolean; checkedItems: Set<string>; onToggleCategory: () => void; onToggleItem: (id: string) => void }) {
  const catCheckedCount = cat.items.filter((i) => checkedItems.has(i.id)).length;
  const isComplete = catCheckedCount === cat.items.length;

  return (
    <Card>
      <CardHeader className="cursor-pointer pb-3" onClick={onToggleCategory}>
        <CategoryCardHeader cat={cat} isCollapsed={isCollapsed} catCheckedCount={catCheckedCount} isComplete={isComplete} />
      </CardHeader>
      {!isCollapsed && <CategoryCardBody cat={cat} checkedItems={checkedItems} onToggleItem={onToggleItem} />}
    </Card>
  );
}

function ChecklistBody({ state, filteredCategories, allItems }: { state: ReturnType<typeof useChecklistState>; filteredCategories: CheckCategory[]; allItems: CheckItem[] }) {
  const codeRedTotal = allItems.filter((i) => i.isCodeRed).length;
  const codeRedChecked = allItems.filter((i) => i.isCodeRed && state.checked.items.has(i.id)).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <ProgressCard checkedCount={state.checked.items.size} totalCount={allItems.length} codeRedChecked={codeRedChecked} codeRedTotal={codeRedTotal} />
      <FilterBar filterMode={state.filterMode} setFilterMode={state.setFilterMode} languageFilter={state.languageFilter} setLanguageFilter={state.setLanguageFilter} />
      <div className="space-y-4">
        {filteredCategories.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} isCollapsed={state.collapsed.items.has(cat.name)} checkedItems={state.checked.items} onToggleCategory={() => state.collapsed.toggle(cat.name)} onToggleItem={state.checked.toggle} />
        ))}
      </div>
    </div>
  );
}

const CodeReviewChecklist = () => {
  const state = useChecklistState();
  const allItems = useMemo(() => categories.flatMap((c) => c.items), []);
  const filteredCategories = useFilteredCategories(state.filterMode, state.languageFilter, state.checked.items);

  return (
    <div className="min-h-screen bg-background">
      <ChecklistHeader onReset={state.checked.reset} />
      <ChecklistBody state={state} filteredCategories={filteredCategories} allItems={allItems} />
    </div>
  );
};

export default CodeReviewChecklist;
