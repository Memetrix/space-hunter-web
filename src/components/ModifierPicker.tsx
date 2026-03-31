'use client';

import type { ModifierDef } from '../data/modifiers';

interface Props {
  choices: ModifierDef[];
  onPick: (mod: ModifierDef) => void;
}

export function ModifierPicker({ choices, onPick }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="flex flex-col items-center gap-4 p-6 max-w-md w-full">
        <h2 className="text-sm tracking-[4px] text-[#cc4400] uppercase font-bold">Choose Modifier</h2>
        <div className="flex flex-col gap-3 w-full">
          {choices.map(mod => (
            <button
              key={mod.id}
              onClick={() => onPick(mod)}
              className="w-full text-left p-3 border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: mod.rarity === 'rare' ? '#aa44ff' : '#44cc44',
                background: mod.rarity === 'rare' ? 'rgba(170,68,255,0.08)' : 'rgba(68,204,68,0.06)',
                color: '#cc8866',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-[2px] uppercase"
                  style={{ color: mod.rarity === 'rare' ? '#aa44ff' : '#44cc44' }}>
                  {mod.name}
                </span>
                {mod.rarity === 'rare' && (
                  <span className="text-[9px] px-1 py-0.5 tracking-[1px]"
                    style={{ border: '1px solid #aa44ff', color: '#aa44ff' }}>
                    RARE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#886644] leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
