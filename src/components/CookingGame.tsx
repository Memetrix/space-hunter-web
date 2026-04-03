'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Recipe } from '../data/recipes';
import { halSay, HAL_COOKING, HAL_COOKING_PERFECT, HAL_COOKING_GOOD, HAL_COOKING_MEH } from '../data/hal';

/* ── Tier config ─────────────────────────────────────────────── */
const TIER_CFG: Record<number, { duration: number; spawnMs: number; speed: number; voidChance: number; goldenChance: number }> = {
  1: { duration: 8, spawnMs: 600, speed: 120, voidChance: 0.10, goldenChance: 0.15 },
  2: { duration: 10, spawnMs: 450, speed: 160, voidChance: 0.20, goldenChance: 0.10 },
  3: { duration: 12, spawnMs: 350, speed: 200, voidChance: 0.30, goldenChance: 0.08 },
};

const ING_ICONS: Record<string, { emoji: string; color: string; label: string }> = {
  rift_dust:     { emoji: '✦', color: '#e6cc4d', label: 'Dust' },
  void_crystal:  { emoji: '◆', color: '#aa44ff', label: 'Crystal' },
  cave_moss:     { emoji: '❋', color: '#4db366', label: 'Moss' },
  river_silt:    { emoji: '◈', color: '#4d99e6', label: 'Silt' },
  elite_core:    { emoji: '⬡', color: '#ffd900', label: 'Core' },
};

type ItemKind = 'normal' | 'golden' | 'void';

interface FallingItem {
  id: number;
  x: number;       // px from left
  y: number;       // px from top
  kind: ItemKind;
  color: string;
  emoji: string;
  tapped: boolean;
  size: number;
  popAnim: boolean; // tap feedback
}

interface Props {
  recipe: Recipe;
  onComplete: (quality: number) => void;
  onCancel: () => void;
}

export function CookingGame({ recipe, onComplete, onCancel }: Props) {
  const [phase, setPhase] = useState<'countdown' | 'cooking' | 'result'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quality, setQuality] = useState(1);
  const [halMsg, setHalMsg] = useState(() => halSay(HAL_COOKING));
  const [items, setItems] = useState<FallingItem[]>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [floats, setFloats] = useState<Array<{ id: number; x: number; y: number; text: string; color: string }>>([]);

  const cfg = TIER_CFG[recipe.tier] ?? TIER_CFG[1];
  const frameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const startTimeRef = useRef(0);
  const nextIdRef = useRef(0);
  const progressRef = useRef(0);
  const comboRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatIdRef = useRef(0);

  // Ingredient visuals from recipe cost keys
  const ingList = Object.keys(recipe.cost).map(k => ING_ICONS[k] ?? { emoji: '●', color: '#cc8866', label: k });

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('cooking'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const spawnItem = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;

    const roll = Math.random();
    let kind: ItemKind = 'normal';
    const ing = ingList[Math.floor(Math.random() * ingList.length)];
    let color = ing.color;
    let emoji = ing.emoji;
    let size = 52;

    if (roll < cfg.voidChance) {
      kind = 'void';
      color = '#8800cc';
      emoji = '☠';
      size = 56;
    } else if (roll < cfg.voidChance + cfg.goldenChance) {
      kind = 'golden';
      color = '#ffd700';
      emoji = '★';
      size = 58;
    }

    const item: FallingItem = {
      id: nextIdRef.current++,
      x: Math.floor(size / 2 + Math.random() * (cw - size)),
      y: -size,
      kind,
      color,
      emoji,
      tapped: false,
      size,
      popAnim: false,
    };
    itemsRef.current = [...itemsRef.current, item];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, ingList]);

  // Main game loop
  useEffect(() => {
    if (phase !== 'cooking') return;

    startTimeRef.current = performance.now();
    lastSpawnRef.current = startTimeRef.current;
    progressRef.current = 0;
    comboRef.current = 0;
    itemsRef.current = [];

    let prevTime = startTimeRef.current;

    const tick = (now: number) => {
      const dt = (now - prevTime) / 1000;
      prevTime = now;

      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, cfg.duration - elapsed);
      setTimeLeft(remaining);

      // Spawn
      if (now - lastSpawnRef.current > cfg.spawnMs) {
        spawnItem();
        lastSpawnRef.current = now;
      }

      // Move items
      const containerH = containerRef.current?.clientHeight ?? 600;
      const alive: FallingItem[] = [];
      for (const item of itemsRef.current) {
        if (item.tapped) continue;
        item.y += cfg.speed * dt;
        if (item.y > containerH + 20) {
          if (item.kind !== 'void') {
            progressRef.current = Math.max(0, progressRef.current - (item.kind === 'golden' ? 4 : 2));
            comboRef.current = 0;
            setCombo(0);
            setShowCombo(false);
          }
          continue;
        }
        alive.push(item);
      }
      itemsRef.current = alive;

      setItems([...alive]);
      setProgress(progressRef.current);

      // Time up
      if (remaining <= 0) {
        const maxProgress = Math.floor(cfg.duration / (cfg.spawnMs / 1000)) * 2;
        const pct = progressRef.current / maxProgress;
        let q = 1;
        if (pct >= 0.9) q = 3;
        else if (pct >= 0.6) q = 2;

        setQuality(q);
        setProgress(progressRef.current);

        if (q === 3) setHalMsg(halSay(HAL_COOKING_PERFECT));
        else if (q === 2) setHalMsg(halSay(HAL_COOKING_GOOD));
        else setHalMsg(halSay(HAL_COOKING_MEH));

        setPhase('result');
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Tap handler
  const handleTap = useCallback((itemId: number, clientX: number, clientY: number) => {
    const item = itemsRef.current.find(i => i.id === itemId);
    if (!item || item.tapped) return;
    item.tapped = true;

    // Float text
    const rect = containerRef.current?.getBoundingClientRect();
    const fx = clientX - (rect?.left ?? 0);
    const fy = clientY - (rect?.top ?? 0);

    if (item.kind === 'void') {
      progressRef.current = Math.max(0, progressRef.current - 5);
      comboRef.current = 0;
      setCombo(0);
      setShowCombo(false);
      setFloats(f => [...f, { id: floatIdRef.current++, x: fx, y: fy, text: '-5', color: '#ff2200' }]);
    } else {
      comboRef.current++;
      setCombo(comboRef.current);
      setShowCombo(comboRef.current >= 3);
      const comboMult = comboRef.current >= 5 ? 2 : comboRef.current >= 3 ? 1.5 : 1;
      const basePts = item.kind === 'golden' ? 6 : 2;
      const pts = Math.floor(basePts * comboMult);
      progressRef.current += pts;
      setFloats(f => [...f, {
        id: floatIdRef.current++, x: fx, y: fy,
        text: `+${pts}${comboRef.current >= 3 ? ' x' + comboRef.current : ''}`,
        color: item.kind === 'golden' ? '#ffd700' : item.color,
      }]);
    }

    itemsRef.current = itemsRef.current.filter(i => i.id !== itemId);
    setItems([...itemsRef.current]);
    setProgress(progressRef.current);

    // Clear float after animation
    setTimeout(() => {
      setFloats(f => f.filter(fl => fl.id !== floatIdRef.current - 1));
    }, 800);
  }, []);

  // Max possible progress for bar display
  const maxProgress = Math.floor(cfg.duration / (cfg.spawnMs / 1000)) * 2;
  const progressPct = Math.min(progress / maxProgress, 1);
  const barColor = progressPct >= 0.9 ? '#ffd700' : progressPct >= 0.6 ? '#4db366' : progressPct >= 0.3 ? '#e6cc4d' : '#cc2200';
  const stars = phase === 'result' ? quality : (progressPct >= 0.9 ? 3 : progressPct >= 0.6 ? 2 : progressPct >= 0.3 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#050508ee' }}>
      <div className="w-full max-w-[540px] h-full flex flex-col" style={{ fontFamily: 'var(--font-pixel)' }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 text-center shrink-0">
          <p className="text-xs tracking-[2px] text-[#886644] uppercase">Cooking</p>
          <p className="text-lg font-bold text-[#cc8866]">{recipe.displayName}</p>
          {phase === 'cooking' && (
            <div className="flex items-center justify-center gap-4 mt-1">
              <p className="text-base text-[#ff4400] font-mono">{timeLeft.toFixed(1)}s</p>
              {showCombo && <p className="text-sm font-bold" style={{ color: '#ffd700' }}>x{combo} COMBO</p>}
            </div>
          )}
        </div>

        {/* Legend */}
        {phase === 'cooking' && (
          <div className="flex justify-center gap-4 px-3 pb-2 shrink-0">
            {ingList.slice(0, 2).map((ing, i) => (
              <span key={i} className="text-xs" style={{ color: ing.color }}>
                <span className="text-sm">{ing.emoji}</span> TAP
              </span>
            ))}
            <span className="text-xs" style={{ color: '#ffd700' }}>
              <span className="text-sm">★</span> BONUS
            </span>
            <span className="text-xs" style={{ color: '#cc00ff' }}>
              <span className="text-sm">☠</span> AVOID
            </span>
          </div>
        )}

        {/* Game area */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden mx-3"
          style={{ border: '1px solid #331a00', background: 'rgba(5,5,8,0.85)', minHeight: 0 }}
        >
          {/* Countdown */}
          {phase === 'countdown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <p className="text-5xl font-bold" style={{ color: '#ff4400', textShadow: '0 0 20px rgba(255,68,0,0.5)' }}>
                {countdown > 0 ? countdown : 'GO!'}
              </p>
              <p className="text-sm text-[#886644]">Tap ingredients · Avoid ☠ void</p>
            </div>
          )}

          {/* Falling items */}
          {phase === 'cooking' && items.map(item => (
            <button
              key={item.id}
              className="absolute flex items-center justify-center select-none"
              style={{
                left: item.x - item.size / 2,
                top: item.y,
                width: item.size,
                height: item.size,
                borderRadius: item.kind === 'void' ? '8px' : '50%',
                background: item.kind === 'void'
                  ? 'radial-gradient(circle, #660099 0%, #330044 100%)'
                  : item.kind === 'golden'
                    ? 'radial-gradient(circle, #ffee88 0%, #cc9900 100%)'
                    : `radial-gradient(circle, ${item.color}cc 0%, ${item.color}66 100%)`,
                boxShadow: item.kind === 'golden'
                  ? '0 0 20px rgba(255,215,0,0.7), inset 0 0 10px rgba(255,255,255,0.3)'
                  : item.kind === 'void'
                    ? '0 0 20px rgba(136,0,204,0.7), inset 0 0 10px rgba(200,0,255,0.3)'
                    : `0 0 12px ${item.color}55`,
                border: item.kind === 'void'
                  ? '2px solid #cc00ff'
                  : item.kind === 'golden'
                    ? '2px solid #ffee88'
                    : `2px solid ${item.color}88`,
                touchAction: 'manipulation',
                transition: 'transform 0.08s',
              }}
              onPointerDown={(e) => { e.preventDefault(); handleTap(item.id, e.clientX, e.clientY); }}
            >
              <span style={{
                fontSize: item.kind === 'void' ? 22 : item.kind === 'golden' ? 24 : 20,
                color: item.kind === 'void' ? '#ff44ff' : item.kind === 'golden' ? '#fff' : '#fff',
                textShadow: '0 0 6px rgba(0,0,0,0.8)',
                filter: item.kind === 'void' ? 'drop-shadow(0 0 4px #cc00ff)' : 'none',
              }}>
                {item.emoji}
              </span>
            </button>
          ))}

          {/* Float text */}
          {floats.map(f => (
            <div key={f.id} className="absolute pointer-events-none font-bold text-sm"
              style={{
                left: f.x, top: f.y, color: f.color,
                textShadow: '0 0 8px rgba(0,0,0,0.9)',
                animation: 'floatUp 0.8s ease-out forwards',
              }}
            >
              {f.text}
            </div>
          ))}

          {/* Result overlay */}
          {phase === 'result' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5" style={{ background: 'rgba(5,5,8,0.92)' }}>
              <div className="text-4xl tracking-[8px]">
                {[1, 2, 3].map(i => (
                  <span key={i} style={{
                    color: i <= quality ? '#ffd700' : '#221100',
                    textShadow: i <= quality ? '0 0 16px rgba(255,215,0,0.6)' : 'none',
                  }}>★</span>
                ))}
              </div>
              <p className="text-2xl font-bold tracking-[3px]" style={{
                color: quality >= 3 ? '#ffd700' : quality >= 2 ? '#4db366' : '#cc8866',
              }}>
                {quality >= 3 ? 'PERFECT' : quality >= 2 ? 'GOOD' : 'BASIC'}
              </p>
              <p className="text-base text-[#cc8866]">
                Reputation × {quality >= 3 ? '2.0' : quality >= 2 ? '1.5' : '1.0'}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mx-3 mt-2 shrink-0">
          <div className="h-4 border border-[#331a00] relative" style={{ background: 'rgba(5,5,8,0.9)' }}>
            <div className="h-full transition-all duration-150" style={{ width: `${progressPct * 100}%`, background: barColor }} />
            {/* Star markers */}
            <div className="absolute top-0 left-[60%] h-full w-px bg-[#886644] opacity-30" />
            <div className="absolute top-0 left-[90%] h-full w-px bg-[#ffd700] opacity-30" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#886644]">
              {[1, 2, 3].map(i => (
                <span key={i} style={{ color: i <= stars ? '#ffd700' : '#221100' }}>★ </span>
              ))}
            </span>
            <span className="text-xs font-mono text-[#886644]">{Math.round(progressPct * 100)}%</span>
          </div>
        </div>

        {/* HAL strip */}
        <div className="mx-3 mt-2 px-4 py-2 text-center shrink-0" style={{ background: 'rgba(204,34,0,0.08)', border: '1px solid #331a00', borderRadius: '20px' }}>
          <p className="text-xs text-[#cc4422] leading-4">HAL: {halMsg}</p>
        </div>

        {/* Bottom button */}
        <div className="px-4 py-3 shrink-0">
          {phase === 'cooking' ? (
            <button className="pixel-btn w-full" onClick={onCancel}>CANCEL</button>
          ) : phase === 'result' ? (
            <button className="pixel-btn pixel-btn-primary w-full text-lg py-4" onClick={() => onComplete(quality)}>
              CONTINUE
            </button>
          ) : null}
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
}
