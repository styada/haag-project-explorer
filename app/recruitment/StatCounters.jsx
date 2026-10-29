'use client';

// Count-up stat band, inspired by the animated counters on
// stanford.edu/research ("A Legacy of Impact"). Numbers ease from 0 to their
// final value the first time the row scrolls into view; static stats (like
// the founding year) skip the animation. Respects prefers-reduced-motion.
//
// Server pages render the final values for SEO/noscript because this is a
// client component mounted during hydration — before hydration the markup
// shows 0s, exactly like Stanford's own counters do.

import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatCounters({ stats }) {
  const ref = useRef(null);
  const [values, setValues] = useState(stats.map(() => 0));
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValues(stats.map((s) => s.value));
      setDone(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          setValues(stats.map((s) => (s.animate ? Math.round(s.value * easeOutCubic(t)) : s.value)));
          if (t < 1) raf = requestAnimationFrame(tick);
          else setDone(true);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stats]);

  return (
    <div className="count-row" ref={ref}>
      {stats.map((s, i) => (
        <div className="count-item" key={s.label}>
          <div
            className="count-num"
            aria-label={done ? String(s.value) : undefined}
          >
            {values[i]}
          </div>
          <div className="count-lbl">{s.label}</div>
          <div className="count-desc">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
