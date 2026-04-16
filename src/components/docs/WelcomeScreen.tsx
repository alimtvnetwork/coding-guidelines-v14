import { BookOpen, FileText } from "lucide-react";

export function WelcomeScreen({ fileCount, onBrowse }: { fileCount: number; onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div className="rounded-2xl bg-primary/5 p-6 mb-6">
        <BookOpen className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2 font-heading">Specification Documentation</h1>
      <WelcomeDescription fileCount={fileCount} />
      <button onClick={onBrowse} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
        <FileText className="h-4 w-4" /> Start Reading
      </button>
    </div>
  );
}

function WelcomeDescription({ fileCount }: { fileCount: number }) {
  return (
    <>
      <p className="text-muted-foreground mb-6 max-w-md">
        Browse {fileCount} spec files covering coding guidelines, error management, database architecture, and more.
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Press <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border font-mono">?</kbd> for keyboard shortcuts
      </p>
    </>
  );
}
