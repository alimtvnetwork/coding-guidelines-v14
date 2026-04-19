import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScaledSlideProps {
  children: ReactNode;
}

// Renders the 1920x1080 slide and scales it to fit the parent container.
// Parent must be position: relative + overflow: hidden.
export function ScaledSlide({ children }: ScaledSlideProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function recompute() {
      const stage = stageRef.current?.parentElement;
      if (!stage) return;
      const sx = stage.clientWidth / 1920;
      const sy = stage.clientHeight / 1080;
      setScale(Math.min(sx, sy));
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    if (stageRef.current?.parentElement) {
      ro.observe(stageRef.current.parentElement);
    }
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="slide-wrapper"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="slide-content">{children}</div>
    </div>
  );
}
