import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InstallCommand = {
  platform: string;
  shell: string;
  command: string;
};

const installCommands: InstallCommand[] = [
  {
    platform: "Windows",
    shell: "PowerShell",
    command: "irm https://raw.githubusercontent.com/alimtvnetwork/gitmap-v2/main/scripts/install.ps1 | iex",
  },
  {
    platform: "macOS / Linux",
    shell: "Bash",
    command: "curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/gitmap-v2/main/scripts/install.sh | bash",
  },
];

function CopyButton({ command }: { command: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className="h-8 shrink-0 px-2 text-muted-foreground hover:text-foreground"
      aria-label="Copy install command"
    >
      {hasCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function InstallCard({ item }: { item: InstallCommand }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/50 transition-colors hover:border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          {item.platform}
          <span className="ml-auto rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {item.shell}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 py-2.5 font-mono text-foreground/90">
          <code className="flex-1 break-all text-[11px] leading-relaxed sm:text-xs md:text-sm md:break-normal md:whitespace-nowrap">
            {item.command}
          </code>
          <CopyButton command={item.command} />
        </div>
      </CardContent>
    </Card>
  );
}

export function InstallSection() {
  return (
    <section className="border-y border-border bg-secondary/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">Install in One Line</h2>
          <p className="text-muted-foreground">
            Version-pinned install scripts with SHA-256 verification
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {installCommands.map((item) => (
            <InstallCard key={item.platform} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
