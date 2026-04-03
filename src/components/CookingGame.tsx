'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Recipe } from '../data/recipes';
import { halSay, HAL_COOKING, HAL_COOKING_PERFECT, HAL_COOKING_GOOD, HAL_COOKING_MEH } from '../data/hal';

const TIER_CFG: Record<number, { duration: number; spawnMs: number; lifeMs: number; voidChance: number; goldenChance: number; cols: number; rows: number }> = {
  1: { duration: 10, spawnMs: 900,  lifeMs: 2000, voidChance: 0.10, goldenChance: 0.15, cols: 3, rows: 3 },
  2: { duration: 12, spawnMs: 700,  lifeMs: 1600, voidChance: 0.20, goldenChance: 0.10, cols: 3, rows: 4 },
  3: { duration: 14, spawnMs: 550,  lifeMs: 1300, voidChance: 0.25, goldenChance: 0.08, cols: 4, rows: 4 },
};

const ING_ICONS: Record<string, { emoji: string; color: string }> = {
  rift_dust:    { emoji: '✦', color: '#e6cc4d' },
  void_crystal: { emoji: '◆', color: '#aa44ff' },
  cave_moss:    { emoji: '❋', color: '#4db366' },
  river_silt:   { emoji: '◈', color: '#4d99e6' },
  elite_core:   { emoji: '⬡', color: '#ffd900' },
};

type CellKind = 'empty' | 'normal' | 'golden' | 'void';

interface Cell {
  id: number;
  kind: CellKind;
  emoji: string;
  color: string;
  spawnedAt: number;
  lifeMs: number;
}

interface Props {
  recipe: Recipe;
  onComplete: (quality: number) => void;
  onCancel: () => void;
}

export function CookingGame({ recipe, onComplete, onCancel }: Props) {
  const cfg = TIER_CFG[recipe.tier] ?? TIER_CFG[1];
  const totalCells = cfg.cols * cfg.rows;

  const [phase, setPhase] = useState<'countdown' | 'cooking' | 'result'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [quality, setQuality] = useState(1);
  const [halMsg, setHalMsg] = useState(() => halSay(HAL_COOKING));
  const [combo, setCombo] = useState(0);
  const [grid, setGrid] = useState<Cell[]>(() =>
    Array.from({ length: totalCells }, (_, i) => ({ id: i, kind: 'empty' as CellKind, emoji: '', color: '', spawnedAt: 0, lifeMs: 0 }))
  );

  const scoreRef = useRef(0);
  const missRef = useRef(0);
  const comboRef = useRef(0);
  const totalSpawned = useRef(0);
  const gridRef = useRef(grid);
  const nextIdRef = useRef(100);
  const startRef = useRef(0);
  const frameRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const ingList = Object.keys(recipe.cost).map(k => ING_ICONS[k] ?? { emoji: '●', color: '#cc8866' });

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('cooking');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Game loop
  useEffect(() => {
    if (phase !== 'cooking') return;

    startRef.current = performance.now();
    lastSpawnRef.current = 0;
    scoreRef.current = 0;
    missRef.current = 0;
    comboRef.current = 0;
    totalSpawned.current = 0;

    // Reset grid
    const emptyGrid: Cell[] = Array.from({ length: totalCells }, (_, i) => ({
      id: i, kind: 'empty' as CellKind, emoji: '', color: '', spawnedAt: 0, lifeMs: 0,
    }));
    gridRef.current = emptyGrid;
    setGrid([...emptyGrid]);

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const remaining = Math.max(0, cfg.duration - elapsed);
      setTimeLeft(remaining);

      // Spawn new items in empty cells
      if (now - lastSpawnRef.current > cfg.spawnMs) {
        lastSpawnRef.current = now;

        // Find empty cells
        const emptyCells = gridRef.current
          .map((c, i) => c.kind === 'empty' ? i : -1)
          .filter(i => i >= 0);

        if (emptyCells.length > 0) {
          const idx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          const roll = Math.random();
          let kind: CellKind = 'normal';
          const ing = ingList[Math.floor(Math.random() * ingList.length)];
          let emoji = ing.emoji;
          let color = ing.color;

          if (roll < cfg.voidChance) {
            kind = 'void';
            emoji = '☠';
            color = '#cc00ff';
          } else if (roll < cfg.voidChance + cfg.goldenChance) {
            kind = 'golden';
            emoji = '★';
            color = '#ffd700';
          }

          gridRef.current[idx] = {
            id: nextIdRef.current++,
            kind, emoji, color,
            spawnedAt: now,
            lifeMs: cfg.lifeMs,
          };
          totalSpawned.current++;
        }
      }

      // Expire old items
      for (let i = 0; i < gridRef.current.length; i++) {
        const cell = gridRef.current[i];
        if (cell.kind !== 'empty' && now - cell.spawnedAt > cell.lifeMs) {
          if (cell.kind !== 'void') {
            missRef.current++;
            comboRef.current = 0;
            setMisses(missRef.current);
            setCombo(0);
          }
          gridRef.current[i] = { id: i, kind: 'empty', emoji: '', color: '', spawnedAt: 0, lifeMs: 0 };
        }
      }

      setGrid([...gridRef.current]);
      setScore(scoreRef.current);

      if (remaining <= 0) {
        // Calculate quality
        const total = totalSpawned.current;
        const hitRate = total > 0 ? scoreRef.current / (total * 2) : 0;
        let q = 1;
        if (hitRate >= 0.8) q = 3;
        else if (hitRate >= 0.5) q = 2;

        setQuality(q);
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

  // Tap cell
  const tapCell = useCallback((idx: number) => {
    const cell = gridRef.current[idx];
    if (cell.kind === 'empty') return;

    if (cell.kind === 'void') {
      // Penalty — lose combo, lose points
      comboRef.current = 0;
      scoreRef.current = Math.max(0, scoreRef.current - 3);
      setCombo(0);
    } else {
      comboRef.current++;
      const mult = comboRef.current >= 5 ? 3 : comboRef.current >= 3 ? 2 : 1;
      const pts = (cell.kind === 'golden' ? 4 : 2) * mult;
      scoreRef.current += pts;
      setCombo(comboRef.current);
    }

    // Clear cell
    gridRef.current[idx] = { id: idx, kind: 'empty', emoji: '', color: '', spawnedAt: 0, lifeMs: 0 };
    setGrid([...gridRef.current]);
    setScore(scoreRef.current);
  }, []);

  const maxScore = Math.floor(cfg.duration / (cfg.spawnMs / 1000)) * 2;
  const pct = Math.min(score / maxScore, 1);
  const barColor = pct >= 0.8 ? '#ffd700' : pct >= 0.5 ? '#4db366' : pct >= 0.2 ? '#e6cc4d' : '#cc2200';
  const stars = phase === 'result' ? quality : (pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : pct >= 0.2 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#050508ee' }}>
      <div className="w-full max-w-[540px] h-full max-h-[900px] flex flex-col" style={{ fontFamily: 'var(--font-pixel)' }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 text-center shrink-0">
          <p className="text-xs tracking-[2px] text-[#886644] uppercase">Cooking</p>
          <p className="text-lg font-bold text-[#cc8866]">{recipe.displayName}</p>
          {phase === 'cooking' && (
            <div className="flex items-center justify-center gap-4 mt-1">
              <span className="text-base font-mono text-[#ff4400]">{timeLeft.toFixed(1)}s</span>
              {combo >= 3 && <span className="text-sm font-bold text-[#ffd700]">x{combo} COMBO</span>}
            </div>
          )}
        </div>

        {/* Legend */}
        {(phase === 'cooking' || phase === 'countdown') && (
          <div className="flex justify-center gap-5 px-3 pb-2 shrink-0">
            <span className="text-xs" style={{ color: ingList[0]?.color ?? '#cc8866' }}>
              <span className="text-base">{ingList[0]?.emoji ?? '●'}</span> = TAP
            </span>
            <span className="text-xs text-[#ffd700]"><span className="text-base">★</span> = BONUS</span>
            <span className="text-xs text-[#cc00ff]"><span className="text-base">☠</span> = DON&apos;T TAP</span>
          </div>
        )}

        {/* Grid area */}
        <div className="flex-1 mx-3 flex items-center justify-center" style={{ minHeight: 0 }}>
          {phase === 'countdown' ? (
            <div className="text-center">
              <p className="text-6xl font-bold" style={{ color: '#ff4400', textShadow: '0 0 24px rgba(255,68,0,0.5)' }}>
                {countdown > 0 ? countdown : 'GO!'}
              </p>
              <p className="text-sm text-[#886644] mt-3">Tap ingredients before they fade</p>
            </div>
          ) : phase === 'cooking' || phase === 'result' ? (
            <div
              className="grid gap-2 w-full"
              style={{
                gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
                maxWidth: cfg.cols * 100,
              }}
            >
              {grid.map((cell, idx) => {
                const isActive = cell.kind !== 'empty';
                const age = isActive ? (performance.now() - cell.spawnedAt) / cell.lifeMs : 0;
                const fading = age > 0.7;

                return (
                  <button
                    key={idx}
                    className="aspect-square flex items-center justify-center select-none transition-all duration-100"
                    style={{
                      background: isActive
                        ? cell.kind === 'void'
                          ? 'radial-gradient(circle, #440066 0%, #220033 100%)'
                          : cell.kind === 'golden'
                            ? 'radial-gradient(circle, #ffee66 0%, #996600 100%)'
                            : `radial-gradient(circle, ${cell.color}88 0%, ${cell.color}33 100%)`
                        : 'rgba(20,15,10,0.5)',
                      border: isActive
                        ? cell.kind === 'void'
                          ? '2px solid #cc00ff'
                          : cell.kind === 'golden'
                            ? '2px solid #ffdd44'
                            : `2px solid ${cell.color}88`
                        : '1px solid #221100',
                      borderRadius: cell.kind === 'void' ? '8px' : '12px',
                      opacity: isActive ? (fading ? 0.4 : 1) : 0.3,
                      boxShadow: isActive && !fading
                        ? cell.kind === 'golden'
                          ? '0 0 20px rgba(255,215,0,0.5), inset 0 0 10px rgba(255,255,200,0.2)'
                          : cell.kind === 'void'
                            ? '0 0 16px rgba(200,0,255,0.4)'
                            : `0 0 12px ${cell.color}33`
                        : 'none',
                      transform: isActive && !fading ? 'scale(1)' : isActive ? 'scale(0.85)' : 'scale(0.9)',
                      touchAction: 'manipulation',
                    }}
                    disabled={!isActive || phase === 'result'}
                    onPointerDown={(e) => { e.preventDefault(); tapCell(idx); }}
                  >
                    {isActive && (
                      <span style={{
                        fontSize: cell.kind === 'golden' ? 28 : cell.kind === 'void' ? 26 : 24,
                        color: cell.kind === 'void' ? '#ff66ff' : '#fff',
                        textShadow: '0 0 8px rgba(0,0,0,0.9)',
                        filter: cell.kind === 'golden' ? 'drop-shadow(0 0 6px #ffd700)' : 'none',
                      }}>
                        {cell.emoji}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}

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
              <p className="text-base text-[#886644]">Score: {score} · Missed: {misses}</p>
              <p className="text-base text-[#cc8866]">
                Reputation × {quality >= 3 ? '2.0' : quality >= 2 ? '1.5' : '1.0'}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mx-3 mt-2 shrink-0">
          <div className="h-4 border border-[#331a00] relative" style={{ background: 'rgba(5,5,8,0.9)' }}>
            <div className="h-full transition-all duration-200" style={{ width: `${pct * 100}%`, background: barColor }} />
            <div className="absolute top-0 left-[50%] h-full w-px bg-[#886644] opacity-30" />
            <div className="absolute top-0 left-[80%] h-full w-px bg-[#ffd700] opacity-30" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#886644]">
              {[1, 2, 3].map(i => (
                <span key={i} style={{ color: i <= stars ? '#ffd700' : '#221100' }}>★ </span>
              ))}
            </span>
            <span className="text-xs font-mono text-[#886644]">{score} pts</span>
          </div>
        </div>

        {/* HAL strip */}
        <div className="mx-3 mt-2 px-4 py-2 text-center shrink-0" style={{ background: 'rgba(204,34,0,0.08)', border: '1px solid #331a00', borderRadius: '20px' }}>
          <p className="text-xs text-[#cc4422] leading-4">HAL: {halMsg}</p>
        </div>

        {/* Button */}
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
    </div>
  );
}
