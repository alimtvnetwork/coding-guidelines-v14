import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import versionData from "@/../version.json";

type InstallCommand = {
  platform: string;
  shell: string;
  command: string;
};

const installCommands: InstallCommand[] = [
  {
    platform: "Windows",
    shell: "PowerShell",
    command: "irm https://raw.githubusercontent.com/alimtvnetwork/coding-guidelines-v14/main/install.ps1 | iex",
  },
  {
    platform: "macOS / Linux",
    shell: "Bash",
    command: "curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/coding-guidelines-v14/main/install.sh | bash",
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

type TokenKind = "command" | "flag" | "url" | "pipe" | "text";

const KNOWN_COMMANDS = new Set(["irm", "iex", "curl", "bash", "sh", "wget", "powershell", "pwsh"]);

function classifyToken(token: string, index: number): TokenKind {
  if (token === "|" || token === "&&" || token === "||" || token === ";") return "pipe";
  if (/^https?:\/\//i.test(token)) return "url";
  if (/^-/.test(token)) return "flag";
  if (index === 0 || KNOWN_COMMANDS.has(token.toLowerCase())) return "command";
  return "text";
}

const TOKEN_CLASS: Record<TokenKind, string> = {
  command: "text-primary font-medium",
  flag: "text-accent-foreground/80",
  url: "text-muted-foreground/90 underline decoration-dotted decoration-muted-foreground/40 underline-offset-2",
  pipe: "text-destructive/80 font-semibold",
  text: "text-foreground/85",
};

function HighlightedCommand({ command }: { command: string }) {
  const tokens = command.split(/(\s+)/);
  let nonSpaceIndex = -1;
  return (
    <>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        nonSpaceIndex += 1;
        const kind = classifyToken(token, nonSpaceIndex);
        return (
          <span key={i} className={TOKEN_CLASS[kind]}>
            {token}
          </span>
        );
      })}
    </>
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
          <span className="mr-1 select-none text-muted-foreground/60">$</span>
          <code className="flex-1 break-all text-[11px] leading-relaxed sm:text-xs md:text-sm md:break-normal md:whitespace-nowrap">
            <HighlightedCommand command={item.command} />
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
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold text-foreground">Install in One Line</h2>
            <Badge variant="secondary" className="text-xs">
              Latest: v{versionData.version}
            </Badge>
          </div>
          <p className="mt-3 text-muted-foreground">
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
