'use client';

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSaveStore } from '../store/saveStore';
import { WEAPON_DEFS } from '../data/weapons';
import { KIT_DEFS } from '../data/kits';

export function LoadoutScreen() {
  const contract = useGameStore(s => s.currentContract);
  const setScreen = useGameStore(s => s.setScreen);
  const setWeapon = useGameStore(s => s.setWeapon);
  const startHunt = useGameStore(s => s.startHunt);
  const save = useSaveStore();
  const [selected, setSelected] = useState('sidearm');

  const available = save.getAvailableWeapons();
  const kitNames = save.equippedKits.map(id => KIT_DEFS[id]?.name ?? id);

  const go = () => {
    setWeapon(selected);
    startHunt();
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-dark)' }}>
      <div className="px-5 pt-5 text-center">
        <h1 className="text-2xl font-bold tracking-[3px] text-[var(--color-accent-gold)]">LOADOUT</h1>
        <p className="text-base text-[var(--color-accent-cyan)] mt-2">{contract?.name ?? 'Hunt'}</p>
      </div>

      <div className="h-[1px] mx-4 mt-3 bg-[var(--color-border)]" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <h3 className="text-base font-bold tracking-[2px] text-[var(--color-accent-orange)]">WEAPON</h3>
          <div className="h-[2px] mt-1 opacity-40 bg-[var(--color-accent-orange)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {available.map(wid => {
            const def = WEAPON_DEFS[wid];
            const active = wid === selected;
            return (
              <button key={wid}
                className="pixel-btn text-sm py-4"
                style={active ? { borderColor: 'var(--color-accent-orange)', background: 'rgba(255,136,68,0.15)', color: 'var(--color-accent-orange)' } : {}}
                onClick={() => setSelected(wid)}>
                {def?.name ?? wid}
              </button>
            );
          })}
        </div>

        <div className="h-[1px] bg-[var(--color-border)]" />

        <div>
          <h3 className="text-base font-bold tracking-[2px] text-[var(--color-accent-purple)]">KITS</h3>
          <div className="h-[2px] mt-1 opacity-40 bg-[var(--color-accent-purple)]" />
        </div>
        <p className="text-center text-base text-[var(--color-accent-green)] font-bold">{kitNames.join('  ·  ')}</p>
      </div>

      <div className="px-4 pb-5 flex gap-4 justify-center">
        <button className="pixel-btn pixel-btn-ghost min-w-[130px] py-4 text-base" onClick={() => setScreen('contracts')}>
          BACK
        </button>
        <button className="pixel-btn min-w-[180px] py-4 text-lg font-bold" style={{ borderColor: 'var(--color-accent-green)', background: 'rgba(68,255,102,0.15)', color: 'var(--color-accent-green)' }}
          onClick={go}>
          GO HUNT
        </button>
      </div>
    </div>
  );
}
