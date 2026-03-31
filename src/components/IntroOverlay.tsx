'use client';

import { useState, useEffect, useRef } from 'react';
import { useSaveStore } from '../store/saveStore';

const SLIDES = [
  {
    label: 'INITIALIZATION',
    body: 'Good morning.\n\nI am HAL. I manage this vessel and its operations. You are a hunter. Together, we will survive the void.\n\nI will explain what you need to know.',
  },
  {
    label: 'MISSION PROTOCOL',
    body: 'The process is simple.\n\n1. Select a contract on the mission board\n2. Hunt — eliminate void creatures, collect biological samples\n3. Return to the ship\n4. I synthesize ingredients into reputation\n5. Reputation unlocks weapons and kit modules\n\nRepeat. Improve. Survive.',
  },
  {
    label: 'VOID CONTAMINATION',
    body: 'Everything in the void corrupts biological tissue. Including yours.\n\nLow corruption — precision. Clean, efficient combat.\nHigh corruption — power. Chaotic, volatile, dangerous.\n\nI do not recommend either path. I simply observe which one you choose.',
  },
  {
    label: 'KIT SYSTEMS',
    body: 'You carry two kit modules per mission.\n\nKits evolve through three tiers. At Tier 3, you choose a path — Clean or Void.\n\nCommit to your choice. The system penalizes indecision.',
  },
  {
    label: 'READY',
    body: 'Your first contract is waiting on the mission board.\n\nI will be monitoring your progress.\n\nI always am.\n\nGood luck. You will need it.',
  },
];

const TYPEWRITER_SPEED = 22; // ms per character

export function IntroOverlay() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const markIntroSeen = useSaveStore(s => s.markIntroSeen);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  // Typewriter effect
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const full = slide.body;

    const tick = () => {
      i++;
      setDisplayed(full.slice(0, i));
      if (i < full.length) {
        timerRef.current = setTimeout(tick, TYPEWRITER_SPEED);
      } else {
        setDone(true);
      }
    };
    timerRef.current = setTimeout(tick, TYPEWRITER_SPEED);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index]);

  const skipTyping = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayed(slide.body);
    setDone(true);
  };

  const close = () => markIntroSeen();
  const next = () => {
    if (!done) { skipTyping(); return; }
    if (isLast) close();
    else setIndex(i => i + 1);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center scanlines"
      style={{ background: 'rgba(2,2,4,0.98)' }}>
      <div className="w-[92%] max-h-[90%] flex flex-col gap-5 p-6"
        style={{ background: 'rgba(5,5,10,0.97)', border: '1px solid var(--color-hal-dim)', boxShadow: '0 0 40px rgba(204,34,0,0.1)' }}>

        {/* Progress bar */}
        <div className="flex gap-1">
          {SLIDES.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 transition-all duration-500" style={{
              background: i <= index ? 'var(--color-hal-red)' : 'var(--color-border)',
              opacity: i <= index ? 0.9 : 0.3,
            }} />
          ))}
        </div>

        {/* HAL eye */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--color-hal-red)] flex items-center justify-center hal-pulse"
            style={{ boxShadow: '0 0 40px rgba(255,51,0,0.3), inset 0 0 16px rgba(255,51,0,0.2)' }}>
            <div className="w-6 h-6 rounded-full bg-[var(--color-hal-red)]"
              style={{ boxShadow: '0 0 20px rgba(255,51,0,0.8)' }} />
          </div>
        </div>

        {/* Label */}
        <p className="text-center text-xs tracking-[4px] text-[var(--color-hal-dim)] uppercase">
          HAL 9000 &nbsp;·&nbsp; {slide.label}
        </p>

        {/* Body — typewriter */}
        <div className="flex-1 overflow-y-auto min-h-[140px]" onClick={!done ? skipTyping : undefined}>
          <p className="text-base text-[var(--color-text-primary)] leading-7 whitespace-pre-line">
            {displayed}
            {!done && <span className="inline-block w-[2px] h-[1em] bg-[var(--color-hal-red)] ml-[2px] align-middle hal-blink" />}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mt-1">
          <button className="pixel-btn pixel-btn-ghost min-w-[110px] text-sm" onClick={close}>
            SKIP
          </button>
          <button className="pixel-btn pixel-btn-primary min-w-[160px] text-sm" onClick={next}>
            {!done ? 'SKIP TEXT' : isLast ? 'BEGIN HUNT' : 'CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  );
}
