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

const ING_COLORS: Record<string, string> = {
  rift_dust: '#e6cc4d',
  void_crystal: '#aa44ff',
  cave_moss: '#4db366',
  river_silt: '#4d99e6',
  elite_core: '#ffd900',
};

type ItemKind = 'normal' | 'golden' | 'void';

interface FallingItem {
  id: number;
  x: number;       // % from left (0-90)
  y: number;       // px from top
  kind: ItemKind;
  color: string;
  tapped: boolean;
  size: number;     // px
}

interface Props {
  recipe: Recipe;
  onComplete: (quality: number) => void;
  onCancel: () => void;
}

export function CookingGame({ recipe, onComplete, onCancel }: Props) {
  const [phase, setPhase] = useState<'cooking' | 'result'>('cooking');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quality, setQuality] = useState(1);
  const [halMsg, setHalMsg] = useState(() => halSay(HAL_COOKING));
  const [items, setItems] = useState<FallingItem[]>([]);

  const cfg = TIER_CFG[recipe.tier] ?? TIER_CFG[1];
  const frameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const startTimeRef = useRef(0);
  const nextIdRef = useRef(0);
  const progressRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Pick ingredient colors from recipe cost
  const ingColors = Object.keys(recipe.cost).map(k => ING_COLORS[k] ?? '#cc8866');

  const spawnItem = useCallback((now: number) => {
    const roll = Math.random();
    let kind: ItemKind = 'normal';
    let color = ingColors[Math.floor(Math.random() * ingColors.length)];
    let size = 44;

    if (roll < cfg.voidChance) {
      kind = 'void';
      color = '#8800cc';
      size = 48;
    } else if (roll < cfg.voidChance + cfg.goldenChance) {
      kind = 'golden';
      color = '#ffd700';
      size = 50;
    }

    const item: FallingItem = {
      id: nextIdRef.current++,
      x: 5 + Math.random() * 80, // 5-85% from left
      y: -size,
      kind,
      color,
      tapped: false,
      size,
    };
    itemsRef.current = [...itemsRef.current, item];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, ingColors]);

  // Main game loop
  useEffect(() => {
    if (phase !== 'cooking') return;

    startTimeRef.current = performance.now();
    lastSpawnRef.current = startTimeRef.current;
    progressRef.current = 0;
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
        spawnItem(now);
        lastSpawnRef.current = now;
      }

      // Move items
      const containerH = containerRef.current?.clientHeight ?? 600;
      const alive: FallingItem[] = [];
      for (const item of itemsRef.current) {
        if (item.tapped) continue;
        item.y += cfg.speed * dt;
        if (item.y > containerH + 20) {
          // Missed — penalty for normal/golden
          if (item.kind !== 'void') {
            progressRef.current = Math.max(0, progressRef.current - (item.kind === 'golden' ? 4 : 2));
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
        // Calculate quality
        const maxProgress = Math.floor(cfg.duration / (cfg.spawnMs / 1000)) * 2;
        const pct = progressRef.current / maxProgress;
        let q = 1;
        if (pct >= 0.9) q = 3;
        else if (pct >= 0.6) q = 2;

        setQuality(q);
        setProgress(progressRef.current);

        // HAL result message
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
  const handleTap = useCallback((itemId: number) => {
    const item = itemsRef.current.find(i => i.id === itemId);
    if (!item || item.tapped) return;

    item.tapped = true;

    if (item.kind === 'void') {
      // Penalty!
      progressRef.current = Math.max(0, progressRef.current - 5);
    } else {
      const pts = item.kind === 'golden' ? 6 : 2;
      progressRef.current += pts;
    }

    itemsRef.current = itemsRef.current.filter(i => i.id !== itemId);
    setItems([...itemsRef.current]);
    setProgress(progressRef.current);
  }, []);

  // Max possible progress for bar display
  const maxProgress = Math.floor(cfg.duration / (cfg.spawnMs / 1000)) * 2;
  const progressPct = Math.min(progress / maxProgress, 1);
  const barColor = progressPct >= 0.9 ? '#ffd700' : progressPct >= 0.6 ? '#4db366' : progressPct >= 0.3 ? '#e6cc4d' : '#cc2200';

  // Stars display
  const stars = phase === 'result' ? quality : (progressPct >= 0.9 ? 3 : progressPct >= 0.6 ? 2 : progressPct >= 0.3 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#050508ee' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 text-center">
        <p className="text-xs tracking-[2px] text-[#886644] uppercase">Cooking</p>
        <p className="text-lg font-bold text-[#cc8866]">{recipe.displayName}</p>
        {phase === 'cooking' && (
          <p className="text-sm text-[#ff4400] font-mono mt-1">{timeLeft.toFixed(1)}s</p>
        )}
      </div>

      {/* Game area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden mx-3"
        style={{ border: '1px solid #331a00', background: 'rgba(5,5,8,0.8)' }}
      >
        {phase === 'cooking' && items.map(item => (
          <button
            key={item.id}
            className="absolute rounded-full flex items-center justify-center select-none active:scale-90 transition-transform"
            style={{
              left: `${item.x}%`,
              top: `${item.y}px`,
              width: item.size,
              height: item.size,
              background: item.color,
              boxShadow: item.kind === 'golden'
                ? '0 0 16px rgba(255,215,0,0.6)'
                : item.kind === 'void'
                  ? '0 0 16px rgba(136,0,204,0.6)'
                  : `0 0 8px ${item.color}44`,
              border: item.kind === 'void' ? '2px solid #cc00ff' : '2px solid rgba(255,255,255,0.2)',
              animation: item.kind === 'void' ? 'pulse 0.6s infinite' : undefined,
              touchAction: 'manipulation',
            }}
            onPointerDown={(e) => { e.preventDefault(); handleTap(item.id); }}
          >
            <span className="text-xs font-bold" style={{ color: item.kind === 'void' ? '#fff' : '#000', textShadow: '0 0 4px rgba(0,0,0,0.5)' }}>
              {item.kind === 'void' ? '✕' : item.kind === 'golden' ? '★' : '●'}
            </span>
          </button>
        ))}

        {/* Result overlay */}
        {phase === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(5,5,8,0.9)' }}>
            <div className="text-3xl">
              {[1, 2, 3].map(i => (
                <span key={i} style={{ color: i <= quality ? '#ffd700' : '#331a00', textShadow: i <= quality ? '0 0 12px rgba(255,215,0,0.5)' : 'none' }}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-lg font-bold" style={{ color: quality >= 3 ? '#ffd700' : quality >= 2 ? '#4db366' : '#cc8866' }}>
              {quality >= 3 ? 'PERFECT' : quality >= 2 ? 'GOOD' : 'BASIC'}
            </p>
            <p className="text-sm text-[#cc8866]">
              Rep: x{quality >= 3 ? '2.0' : quality >= 2 ? '1.5' : '1.0'}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mx-3 mt-2">
        <div className="h-3 border border-[#331a00]" style={{ background: 'rgba(5,5,8,0.9)' }}>
          <div
            className="h-full transition-all duration-150"
            style={{ width: `${progressPct * 100}%`, background: barColor }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#886644]">
            {[1, 2, 3].map(i => (
              <span key={i} style={{ color: i <= stars ? '#ffd700' : '#331a00' }}>★</span>
            ))}
          </span>
          <span className="text-xs text-[#886644]">{Math.round(progressPct * 100)}%</span>
        </div>
      </div>

      {/* HAL strip */}
      <div className="mx-3 mt-2 px-3 py-2 rounded-full text-center" style={{ background: 'rgba(204,34,0,0.08)', border: '1px solid #331a00' }}>
        <p className="text-xs text-[#cc4422]">HAL: {halMsg}</p>
      </div>

      {/* Bottom button */}
      <div className="px-4 py-4">
        {phase === 'cooking' ? (
          <button className="pixel-btn w-full" onClick={onCancel}>CANCEL</button>
        ) : (
          <button className="pixel-btn pixel-btn-primary w-full text-lg py-4" onClick={() => onComplete(quality)}>
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
}
