'use client';
import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSaveStore } from '../store/saveStore';
import { RECIPES, BONUS_DESCS, TRACK_ORDER, REP_THRESHOLDS } from '../data/recipes';
import type { Recipe } from '../data/recipes';
import { KIT_DEFS, ALL_KIT_IDS } from '../data/kits';
import {
  halSay, HAL_GREETINGS, HAL_FIRST_VISIT, HAL_PRE_CONTRACT,
  HAL_POST_HUNT_SUCCESS, HAL_POST_HUNT_FAIL, HAL_IDLE
} from '../data/hal';
import { CookingGame } from './CookingGame';

const UPGRADE_DEFS = [
  { id: 'max_hp', name: 'Reinforced Suit', desc: 'Max HP +2', cost: 80, maxLevel: 3 },
  { id: 'mag_size', name: 'Extended Magazine', desc: 'Mag Size +3', cost: 60, maxLevel: 3 },
  { id: 'xp_rate', name: 'Void Attunement', desc: 'XP Rate +10%', cost: 50, maxLevel: 3 },
  { id: 'loadout_slots', name: 'Extra Loadout', desc: '+1 slot', cost: 100, maxLevel: 2 },
];

const WEAPON_UNLOCK_DEFS = [
  { id: 'scatter', name: 'Scatter Pistol', desc: 'Close-range burst', cost: 120 },
  { id: 'lance', name: 'Void Lance', desc: 'Piercing beam', cost: 150 },
  { id: 'baton', name: 'Shock Baton', desc: 'Melee AOE', cost: 130 },
  { id: 'dart', name: 'Homing Dart', desc: 'Homing shots', cost: 80 },
  { id: 'flamethrower', name: 'Flamethrower', desc: 'Cone damage', cost: 180 },
  { id: 'grenade_launcher', name: 'Grenade Launcher', desc: 'Explosive', cost: 160 },
];

const TRACK_COLORS: Record<string, string> = {
  contractor: '#44cc44',
  void_walker: '#aa44ff',
  tactician: '#4d80e6',
  scrapper: '#ff8844',
};

const PANTRY_COLORS: Record<string, string> = {
  rift_dust: '#e6cc4d',
  void_crystal: '#aa44ff',
  cave_moss: '#4db366',
  river_silt: '#4d99e6',
  elite_core: '#ffd900',
};

const ING_ORDER = ['rift_dust', 'void_crystal', 'cave_moss', 'river_silt', 'elite_core'];

type Tab = 'ship' | 'upgrades' | 'kits';

export function HubScreen() {
  const [tab, setTab] = useState<Tab>('ship');
  const save = useSaveStore();
  const setScreen = useGameStore(s => s.setScreen);
  const huntResult = useGameStore(s => s.huntResult);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-dark)' }}>
      {/* HAL Header */}
      <div className="px-5 pt-5 pb-3 text-center relative">
        <div
          className="mx-auto w-14 h-14 rounded-full border-2 border-[var(--color-hal-red)] flex items-center justify-center mb-3 hal-pulse"
          style={{ boxShadow: '0 0 30px rgba(255,51,0,0.25), inset 0 0 12px rgba(255,51,0,0.18)' }}
        >
          <div className="w-5 h-5 rounded-full bg-[var(--color-hal-red)]" style={{ boxShadow: '0 0 16px rgba(255,51,0,0.7)' }} />
        </div>
        <h1 className="text-2xl font-bold tracking-[4px] text-[var(--color-hal-glow)] hal-blink">SPACE HUNTER</h1>
        <p className="text-sm tracking-[2px] text-[var(--color-text-secondary)] mt-1 uppercase">
          {save.totalCredits} cr &nbsp;&middot;&nbsp; {save.contractsCompleted} missions &nbsp;&middot;&nbsp; corruption {save.totalCorruption}
        </p>
      </div>
      <div className="h-[1px] mx-4 bg-[var(--color-hal-dim)]" style={{ opacity: 0.4 }} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {tab === 'ship' && <ShipTab save={save} huntResult={huntResult} onContracts={() => setScreen('contracts')} />}
        {tab === 'upgrades' && <UpgradesTab save={save} />}
        {tab === 'kits' && <KitsTab save={save} />}
      </div>

      {/* Bottom Nav */}
      <div className="mx-3 mb-3 flex gap-0 border border-[var(--color-border)]" style={{ background: 'rgba(5,5,8,0.9)' }}>
        {(['ship', 'upgrades', 'kits'] as Tab[]).map(t => {
          const active = tab === t;
          return (
            <button
              key={t}
              className="flex-1 py-4 text-sm font-bold uppercase tracking-[2px] transition-all border-r last:border-r-0 border-[var(--color-border)]"
              style={{
                background: active ? 'rgba(204,34,0,0.12)' : 'transparent',
                borderBottom: active ? '3px solid var(--color-hal-red)' : '3px solid transparent',
                color: active ? 'var(--color-hal-glow)' : 'var(--color-text-muted)',
              }}
              onClick={() => setTab(t)}
            >
              {t === 'ship' ? 'hub' : t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HalMessage({ message }: { message: string }) {
  return (
    <div className="pixel-card relative overflow-hidden" style={{ borderColor: 'var(--color-hal-dim)' }}>
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-hal-red)] hal-pulse" />
      <div className="pl-4">
        <p className="text-xs tracking-[2px] text-[var(--color-hal-dim)] mb-2 uppercase">HAL 9000</p>
        <p className="text-base text-[var(--color-text-primary)] leading-6">{message}</p>
      </div>
    </div>
  );
}

function SectionHeader({ text, color = 'var(--color-accent-cyan)' }: { text: string; color?: string }) {
  return (
    <div>
      <h3 className="text-base font-bold tracking-[2px]" style={{ color }}>{text}</h3>
      <div className="h-[2px] mt-1 opacity-40" style={{ background: color }} />
    </div>
  );
}

function ShipTab({ save, huntResult, onContracts }: {
  save: ReturnType<typeof useSaveStore.getState>;
  huntResult: ReturnType<typeof useGameStore.getState>['huntResult'];
  onContracts: () => void
}) {
  const halMsg = useMemo(() => {
    if (save.contractsCompleted === 0 && !huntResult) return halSay(HAL_FIRST_VISIT);
    if (huntResult) {
      return huntResult.huntStatus === 'COMPLETED'
        ? halSay(HAL_POST_HUNT_SUCCESS)
        : halSay(HAL_POST_HUNT_FAIL);
    }
    return Math.random() < 0.6 ? halSay(HAL_PRE_CONTRACT) : halSay(HAL_IDLE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save.contractsCompleted, !!huntResult]);

  return (
    <>
      <HalMessage message={halMsg} />

      {huntResult && (
        <div className="pixel-card" style={{ borderColor: 'var(--color-hal-dim)' }}>
          <p className="text-xs tracking-[1px] text-[var(--color-hal-dim)] mb-2 uppercase">Mission Report</p>
          <p className="text-sm text-[var(--color-text-primary)] text-center">
            +{huntResult.credits}cr &middot; {huntResult.totalKills} kills
            {huntResult.ingredients.length > 0 ? ` · +${huntResult.ingredients.length} ingredients` : ''}
          </p>
        </div>
      )}

      <button className="pixel-btn pixel-btn-primary w-full text-lg py-5" onClick={onContracts}>
        CONTRACT BOARD
      </button>

      <SectionHeader text="PANTRY" color="var(--color-accent-orange)" />
      <div className="flex gap-3 justify-center py-2">
        {ING_ORDER.map(id => {
          const count = save.pantry[id] ?? 0;
          const color = PANTRY_COLORS[id] ?? '#fff';
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9" style={{ background: count > 0 ? color : color + '30' }} />
              <span className="text-sm font-bold" style={{ color: count > 0 ? color : 'var(--color-text-muted)' }}>{count}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{id.replace('_', ' ').slice(0, 8)}</span>
            </div>
          );
        })}
      </div>

      <SectionHeader text="REPUTATION" color="var(--color-accent-cyan)" />
      {TRACK_ORDER.map(track => {
        const pts = save.reputation[track] ?? 0;
        const level = save.getRepLevel(track);
        const color = TRACK_COLORS[track];
        const maxed = level >= REP_THRESHOLDS.length - 1;
        const nextPts = maxed ? pts : REP_THRESHOLDS[level + 1];
        const prevPts = REP_THRESHOLDS[level];
        const frac = maxed ? 1 : Math.min((pts - prevPts) / (nextPts - prevPts), 1);

        return (
          <div key={track} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color }}>{track.replace('_', ' ')} Lv{level}</span>
              <span className="text-[var(--color-text-muted)]">{maxed ? 'MAX' : `${pts}/${nextPts}`}</span>
            </div>
            <div className="pixel-bar"><div className="pixel-bar-fill" style={{ width: `${frac * 100}%`, background: color }} /></div>
          </div>
        );
      })}

      <SectionHeader text="KITCHEN" color="var(--color-accent-red)" />
      <KitchenSection save={save} />
    </>
  );
}

function KitchenSection({ save }: { save: ReturnType<typeof useSaveStore.getState> }) {
  const cookRecipe = useSaveStore(s => s.cookRecipe);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  const canAfford = (cost: Record<string, number>) => {
    for (const [k, v] of Object.entries(cost)) {
      if ((save.pantry[k] ?? 0) < v) return false;
    }
    return true;
  };

  const isUnlocked = (recipe: typeof RECIPES[string]) => {
    if (recipe.tier === 1) return true;
    if (recipe.tier === 2) return save.unlockedRecipes.includes(recipe.id) || save.getRepLevel(recipe.track) >= 1;
    return save.unlockedRecipes.includes(recipe.id);
  };

  const handleCookComplete = (quality: number) => {
    if (!cookingRecipe) return;
    cookRecipe(cookingRecipe.cost, cookingRecipe.track, cookingRecipe.rep, cookingRecipe.bonus, quality);
    setCookingRecipe(null);
  };

  return (
    <div className="space-y-3">
      {cookingRecipe && (
        <CookingGame
          recipe={cookingRecipe}
          onComplete={handleCookComplete}
          onCancel={() => setCookingRecipe(null)}
        />
      )}
      {TRACK_ORDER.map(track => {
        const color = TRACK_COLORS[track];
        const trackRecipes = Object.values(RECIPES).filter(r => r.track === track);
        const unlocked = trackRecipes.filter(r => isUnlocked(r));
        const locked = trackRecipes.length - unlocked.length;

        return (
          <div key={track}>
            <span className="text-sm font-bold" style={{ color }}>{track.replace('_', ' ')}</span>
            {unlocked.map(r => {
              const affordable = canAfford(r.cost);
              const costStr = Object.entries(r.cost).map(([k, v]) => `${k.replace('_', ' ')} x${v}`).join(', ');
              return (
                <div key={r.id} className="pixel-card flex items-center gap-3 mt-2 py-3">
                  <div className="flex-1">
                    <p className={`text-sm ${affordable ? '' : 'opacity-40'}`}>{r.displayName}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{costStr} +{r.rep}rep {r.bonus ? BONUS_DESCS[r.bonus] : ''}</p>
                  </div>
                  <button
                    className="pixel-btn text-sm py-2 px-4"
                    style={{ borderColor: color, color }}
                    disabled={!affordable}
                    onClick={() => setCookingRecipe(r)}>
                    Cook
                  </button>
                </div>
              );
            })}
            {locked > 0 && <p className="text-xs text-[var(--color-text-muted)] mt-1">+ {locked} locked</p>}
          </div>
        );
      })}
    </div>
  );
}

function UpgradesTab({ save }: { save: ReturnType<typeof useSaveStore.getState> }) {
  const buyUpgrade = useSaveStore(s => s.buyUpgrade);
  const unlockWeapon = useSaveStore(s => s.unlockWeapon);

  return (
    <>
      <p className="text-center text-base text-[var(--color-accent-gold)] font-bold">Credits: {save.totalCredits}</p>
      <SectionHeader text="SUIT UPGRADES" color="var(--color-accent-cyan)" />
      {UPGRADE_DEFS.map(def => {
        const level = save.shipUpgrades[def.id] ?? 0;
        const maxed = level >= def.maxLevel;
        return (
          <div key={def.id} className="pixel-card flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold">{def.name} <span className="text-[var(--color-text-muted)]">Lv{level}/{def.maxLevel}</span></p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{def.desc}</p>
            </div>
            <button
              className="pixel-btn text-sm py-2 px-4"
              disabled={maxed || save.totalCredits < def.cost}
              onClick={() => buyUpgrade(def.id, def.cost, def.maxLevel)}>
              {maxed ? 'MAX' : `${def.cost}cr`}
            </button>
          </div>
        );
      })}
      <SectionHeader text="WEAPONS" color="var(--color-accent-orange)" />
      {WEAPON_UNLOCK_DEFS.map(def => {
        const owned = save.unlockedWeapons.includes(def.id);
        return (
          <div key={def.id} className="pixel-card flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold">{def.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{def.desc}</p>
            </div>
            <button
              className="pixel-btn text-sm py-2 px-4"
              style={{ borderColor: 'var(--color-accent-orange)', color: 'var(--color-accent-orange)' }}
              disabled={owned || save.totalCredits < def.cost}
              onClick={() => unlockWeapon(def.id, def.cost)}>
              {owned ? 'OWNED' : `${def.cost}cr`}
            </button>
          </div>
        );
      })}
    </>
  );
}

function KitsTab({ save }: { save: ReturnType<typeof useSaveStore.getState> }) {
  const unlockKit = useSaveStore(s => s.unlockKit);
  const upgradeKitTier = useSaveStore(s => s.upgradeKitTier);
  const assignKit = useSaveStore(s => s.assignKit);

  const s1 = save.equippedKits[0] ?? 'none';
  const s2 = save.equippedKits[1] ?? 'none';

  return (
    <>
      <p className="text-center text-base text-[var(--color-accent-gold)] font-bold">Credits: {save.totalCredits}</p>
      <div className="flex justify-center gap-4 mt-1">
        <span className="text-sm font-bold" style={{
          color: 'var(--color-accent-green)',
          border: '1px solid var(--color-accent-green)',
          background: 'rgba(68,255,102,0.1)',
          padding: '4px 12px',
        }}>S1: {KIT_DEFS[s1]?.name ?? s1}</span>
        <span className="text-sm font-bold" style={{
          color: 'var(--color-accent-cyan)',
          border: '1px solid var(--color-accent-cyan)',
          background: 'rgba(34,153,204,0.1)',
          padding: '4px 12px',
        }}>S2: {KIT_DEFS[s2]?.name ?? s2}</span>
      </div>
      <div className="h-[1px] bg-[var(--color-border)]" />

      {ALL_KIT_IDS.map(id => {
        const def = KIT_DEFS[id];
        const owned = save.unlockedKits.includes(id);
        const tier = save.kitTiers[id] ?? 0;
        const t3Choice = save.kitT3Choices[id] ?? '';
        const isS1 = s1 === id;
        const isS2 = s2 === id;
        const isEquipped = isS1 || isS2;

        return (
          <div key={id} className="pixel-card space-y-3" style={isEquipped ? {
            borderColor: isS1 ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)',
            background: isS1 ? 'rgba(68,255,102,0.06)' : 'rgba(34,153,204,0.06)',
            boxShadow: isS1
              ? '0 0 12px rgba(68,255,102,0.08), inset 0 0 12px rgba(68,255,102,0.04)'
              : '0 0 12px rgba(34,153,204,0.08), inset 0 0 12px rgba(34,153,204,0.04)',
          } : {}}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">{def.name}</span>
              <div className="flex items-center gap-2">
                {isEquipped && (
                  <span className="text-xs font-bold" style={{
                    color: isS1 ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)',
                    border: `1px solid ${isS1 ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)'}`,
                    padding: '2px 6px',
                  }}>
                    {isS1 && isS2 ? 'S1+S2' : isS1 ? 'S1' : 'S2'}
                  </span>
                )}
                {owned && <span className="text-xs text-[var(--color-accent-cyan)]">TIER {tier}</span>}
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">{def.desc}</p>
            <div className="flex gap-2 flex-wrap">
              {!owned ? (
                <button
                  className="pixel-btn text-sm py-2 px-4"
                  style={{ borderColor: 'var(--color-accent-green)', color: 'var(--color-accent-green)' }}
                  disabled={save.totalCredits < def.unlockCost}
                  onClick={() => unlockKit(id, def.unlockCost)}>
                  Unlock {def.unlockCost}cr
                </button>
              ) : (
                <>
                  {tier < 2 && (
                    <button className="pixel-btn text-sm py-2 px-4"
                      style={{ borderColor: 'var(--color-accent-purple)', color: 'var(--color-accent-purple)' }}
                      disabled={save.totalCredits < def.tierCosts[1]}
                      onClick={() => upgradeKitTier(id, 2, def.tierCosts[1])}>
                      T2 {def.tierCosts[1]}cr
                    </button>
                  )}
                  {tier === 2 && (
                    <button className="pixel-btn text-sm py-2 px-4"
                      style={{ borderColor: 'var(--color-accent-purple)', color: 'var(--color-accent-purple)' }}
                      disabled={save.totalCredits < def.tierCosts[2]}
                      onClick={() => upgradeKitTier(id, 3, def.tierCosts[2])}>
                      T3 {def.tierCosts[2]}cr
                    </button>
                  )}
                  {tier >= 3 && (
                    <span className="text-sm text-[var(--color-accent-gold)]">MAX {t3Choice ? `(${t3Choice})` : ''}</span>
                  )}
                  <button
                    className="pixel-btn text-sm py-2 px-4"
                    style={isS1 ? {
                      borderColor: 'var(--color-accent-green)',
                      background: 'rgba(68,255,102,0.2)',
                      color: 'var(--color-accent-green)',
                      boxShadow: '0 0 8px rgba(68,255,102,0.15)',
                    } : {
                      borderColor: 'var(--color-border-light)',
                      color: 'var(--color-text-secondary)',
                    }}
                    onClick={() => assignKit(id, 0)}>S1</button>
                  <button
                    className="pixel-btn text-sm py-2 px-4"
                    style={isS2 ? {
                      borderColor: 'var(--color-accent-cyan)',
                      background: 'rgba(34,153,204,0.2)',
                      color: 'var(--color-accent-cyan)',
                      boxShadow: '0 0 8px rgba(34,153,204,0.15)',
                    } : {
                      borderColor: 'var(--color-border-light)',
                      color: 'var(--color-text-secondary)',
                    }}
                    onClick={() => assignKit(id, 1)}>S2</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
