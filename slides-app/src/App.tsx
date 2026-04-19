import { useCallback, useEffect, useState } from "react";
import { Maximize, Grid3x3, Presentation, Sun, Moon } from "lucide-react";
import { ScaledSlide } from "./components/ScaledSlide";
import { DECK } from "./deck";

type View = "deck" | "grid" | "presenter";

function readSlideFromHash(): number {
  const m = window.location.hash.match(/^#\/(\d+)/);
  if (!m) return 0;
  return clampSlide(parseInt(m[1], 10));
}

function clampSlide(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  if (n >= DECK.length) return DECK.length - 1;
  return n;
}

function writeSlideToHash(n: number) {
  window.location.hash = `/${n}`;
}

export default function App() {
  const [index, setIndex] = useState(readSlideFromHash);
  const [view, setView] = useState<View>("deck");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    function onHash() {
      setIndex(readSlideFromHash());
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goto = useCallback((n: number) => {
    const next = clampSlide(n);
    writeSlideToHash(next);
    setIndex(next);
  }, []);

  const next = useCallback(() => goto(index + 1), [index, goto]);
  const prev = useCallback(() => goto(index - 1), [index, goto]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goto(0);
          break;
        case "End":
          e.preventDefault();
          goto(DECK.length - 1);
          break;
        case "g":
        case "G":
          setView((v) => (v === "grid" ? "deck" : "grid"));
          break;
        case "p":
        case "P":
          setView((v) => (v === "presenter" ? "deck" : "presenter"));
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "Escape":
          if (view !== "deck") setView("deck");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goto, toggleFullscreen, view]);

  const Current = DECK[index].component;
  const NextSlide = DECK[Math.min(index + 1, DECK.length - 1)].component;

  if (view === "grid") {
    return (
      <GridView
        currentIndex={index}
        onPick={(n) => {
          goto(n);
          setView("deck");
        }}
        onClose={() => setView("deck")}
      />
    );
  }

  if (view === "presenter") {
    return (
      <PresenterView
        Current={Current}
        Next={NextSlide}
        index={index}
        total={DECK.length}
        onClose={() => setView("deck")}
      />
    );
  }

  return (
    <div className="deck-root">
      <div className="scaled-stage">
        <ScaledSlide key={index}>
          <Current />
        </ScaledSlide>
      </div>

      <div className="toolbar">
        <button onClick={() => setView("grid")} title="Grid (G)">
          <Grid3x3 size={14} /> Grid
        </button>
        <button onClick={() => setView("presenter")} title="Presenter (P)">
          <Presentation size={14} /> Presenter
        </button>
        <button onClick={toggleFullscreen} title="Fullscreen (F)">
          <Maximize size={14} /> Fullscreen
        </button>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          title="Theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <div className="nav-pill">
        <button onClick={prev} aria-label="Previous">←</button>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {String(index + 1).padStart(2, "0")} / {String(DECK.length).padStart(2, "0")}
        </span>
        <button onClick={next} aria-label="Next">→</button>
      </div>
    </div>
  );
}

function GridView({
  currentIndex,
  onPick,
  onClose,
}: {
  currentIndex: number;
  onPick: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="grid-view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1600,
          margin: "0 auto 24px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24 }}>All slides ({DECK.length})</h2>
        <button
          onClick={onClose}
          style={{
            background: "hsl(var(--bg-raised))",
            color: "hsl(var(--fg))",
            border: "1px solid hsl(var(--border))",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Close (Esc)
        </button>
      </div>
      <div className="grid-view-grid">
        {DECK.map((slide, i) => {
          const Comp = slide.component;
          return (
            <div
              key={slide.id}
              className="grid-thumb"
              style={{
                outline: i === currentIndex ? "2px solid hsl(var(--primary))" : "none",
              }}
              onClick={() => onPick(i)}
            >
              <ScaledSlide>
                <Comp />
              </ScaledSlide>
              <div className="grid-thumb-label">
                {String(i + 1).padStart(2, "0")} · {slide.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PresenterView({
  Current,
  Next,
  index,
  total,
  onClose,
}: {
  Current: React.ComponentType;
  Next: React.ComponentType;
  index: number;
  total: number;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="presenter-view">
      <div className="presenter-main">
        <ScaledSlide>
          <Current />
        </ScaledSlide>
      </div>
      <div className="presenter-side">
        <div className="presenter-next">
          <ScaledSlide>
            <Next />
          </ScaledSlide>
        </div>
        <div className="presenter-notes">
          <strong>Slide {index + 1} of {total}</strong>
          {"\n\n"}
          Use ← → to navigate. Press P or Esc to exit presenter view. Press F for fullscreen.
        </div>
        <div className="presenter-timer">⏱ {mm}:{ss}</div>
        <button
          onClick={onClose}
          style={{
            background: "hsl(var(--bg-raised))",
            color: "hsl(var(--fg))",
            border: "1px solid hsl(var(--border))",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Close presenter (Esc)
        </button>
      </div>
    </div>
  );
}
