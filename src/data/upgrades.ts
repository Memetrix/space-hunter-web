/**
 * 3-slot upgrade generation system.
 * Ported from Godot _generate_upgrades().
 *
 * Slot 1: WEAPON — level perk, mutation fork, or mastery
 * Slot 2: KIT/RESONANCE — kit tier upgrade, resonance perk, or modifier fallback
 * Slot 3: MODIFIER — random from pool
 * + Up to 1 kit perk appended per screen
 */

import { WEAPON_DEFS, WEAPON_LEVEL_PERKS, WEAPON_MUTATIONS, WEAPON_MASTERY } from './weapons';
import { KIT_DEFS, KIT_PERKS, RESONANCE_POOL } from './kits';
import { MODIFIER_DEFS } from './modifiers';

export type UpgradeRarity = 'common' | 'rare' | 'legendary';

export type UpgradeType =
  | 'weapon_upgrade'
  | 'mutation'
  | 'mastery'
  | 'kit_tier'
  | 'kit_perk'
  | 'resonance'
  | 'modifier'
  | 'fallback';

export interface UpgradeCard {
  type: UpgradeType;
  id: string;
  rarity: UpgradeRarity;
  icon: string;
  label: string;
  desc: string;
  // Type-specific payload
  weaponId?: string;
  mutationType?: 'clean' | 'void';
  kitId?: string;
  newTier?: number;
  perkEffect?: string;
  perkValue?: number | boolean;
}

export interface ProgressionState {
  weaponId: string;
  weaponLevel: number;       // 1-5
  weaponMutated: boolean;
  weaponMutationType: string; // 'clean' | 'void' | ''
  corruption: number;
  equippedKits: string[];
  kitTiers: Record<string, number>;  // run-local kit tiers
  kitPerksTaken: string[];
  masteryTaken: string[];
  resonanceTaken: string[];
  modifiersTaken: string[];
  kitT3Pending: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateUpgrades(state: ProgressionState): UpgradeCard[] {
  const options: UpgradeCard[] = [];
  const { weaponId, weaponLevel, weaponMutated, weaponMutationType, corruption } = state;

  // ── Slot 1: WEAPON ─���
  if (weaponLevel >= 5 && !weaponMutated && WEAPON_MUTATIONS[weaponId]) {
    // Offer mutation cards based on corruption
    if (corruption < 35) {
      const mut = WEAPON_MUTATIONS[weaponId].clean;
      options.push({
        type: 'mutation', id: `mut_${weaponId}_clean`, rarity: 'legendary',
        icon: mut.icon, label: mut.name, desc: mut.desc,
        weaponId, mutationType: 'clean',
      });
    }
    if (corruption > 20) {
      const mut = WEAPON_MUTATIONS[weaponId].void;
      options.push({
        type: 'mutation', id: `mut_${weaponId}_void`, rarity: 'legendary',
        icon: mut.icon, label: mut.name, desc: mut.desc,
        weaponId, mutationType: 'void',
      });
    }
    // If no mutations available (corruption exactly 35 and <=20 — shouldn't happen but safety)
    if (options.length === 0) {
      const wdef = WEAPON_DEFS[weaponId];
      options.push({
        type: 'modifier', id: 'mastery_dmg', rarity: 'common',
        icon: 'W', label: `Mastery: ${wdef?.name ?? weaponId}`, desc: '+2 damage',
      });
    }
  } else if (weaponLevel < 5) {
    const nextLevel = weaponLevel + 1;
    const perks = WEAPON_LEVEL_PERKS[weaponId];
    if (perks && perks[nextLevel]) {
      const perk = perks[nextLevel];
      const wdef = WEAPON_DEFS[weaponId];
      options.push({
        type: 'weapon_upgrade', id: `wperk_${weaponId}_${nextLevel}`,
        rarity: nextLevel >= 4 ? 'rare' : 'common',
        icon: perk.icon, label: `${wdef?.name ?? weaponId} — ${perk.name}`, desc: perk.desc,
        weaponId, perkEffect: perk.effect, perkValue: perk.value,
      });
    } else {
      const wdef = WEAPON_DEFS[weaponId];
      options.push({
        type: 'weapon_upgrade', id: `wperk_${weaponId}_${weaponLevel + 1}`,
        rarity: 'common', icon: 'W',
        label: `${wdef?.name ?? weaponId} Lv${weaponLevel + 1}`, desc: '+1 damage',
        weaponId, perkEffect: 'damage', perkValue: 1,
      });
    }
  } else {
    // Mutated — offer mastery perk
    const masteryPool = WEAPON_MASTERY[weaponId]?.[weaponMutationType];
    if (masteryPool) {
      const available = shuffle(masteryPool.filter(mp => !state.masteryTaken.includes(mp.id)));
      if (available.length > 0) {
        const perk = available[0];
        options.push({
          type: 'mastery', id: perk.id, rarity: 'rare',
          icon: perk.icon, label: perk.name, desc: perk.desc,
          weaponId,
        });
      } else {
        const wdef = WEAPON_DEFS[weaponId];
        options.push({
          type: 'modifier', id: 'mastery_dmg', rarity: 'common',
          icon: 'W', label: `Mastery: ${wdef?.name ?? weaponId}`, desc: '+2 damage',
        });
      }
    } else {
      const wdef = WEAPON_DEFS[weaponId];
      options.push({
        type: 'modifier', id: 'mastery_dmg', rarity: 'common',
        icon: 'W', label: `Mastery: ${wdef?.name ?? weaponId}`, desc: '+2 damage',
      });
    }
  }

  // ── Slot 2: KIT TIER, RESONANCE, or MODIFIER ──
  let slot2Done = false;

  // Check if both kits are T3 — offer resonance
  const bothT3 = state.equippedKits.length >= 2 &&
    (state.kitTiers[state.equippedKits[0]] ?? 1) >= 3 &&
    (state.kitTiers[state.equippedKits[1]] ?? 1) >= 3;

  if (bothT3) {
    const availRes = shuffle(
      RESONANCE_POOL.filter(rp => {
        if (state.resonanceTaken.includes(rp.id)) return false;
        return rp.kits.every(k => state.equippedKits.includes(k));
      })
    );
    if (availRes.length > 0) {
      const rp = availRes[0];
      options.push({
        type: 'resonance', id: rp.id, rarity: 'legendary',
        icon: rp.icon, label: rp.name, desc: rp.desc,
      });
      slot2Done = true;
    }
  }

  if (!slot2Done) {
    // Collect kits eligible for tier upgrade
    const t3Eligible: string[] = [];
    const t2Eligible: string[] = [];
    for (const kid of state.equippedKits) {
      const kt = state.kitTiers[kid] ?? 1;
      if (kt === 2) t3Eligible.push(kid);
      else if (kt < 2) t2Eligible.push(kid);
    }

    if (t3Eligible.length > 0) {
      // Queue T3 path choices (handled by Game.ts kitT3Pending)
      for (const kid of shuffle(t3Eligible)) {
        if (!state.kitT3Pending.includes(kid)) {
          state.kitT3Pending.push(kid);
        }
      }
      slot2Done = true; // T3 path choice fires separately
    } else if (t2Eligible.length > 0) {
      const kid = t2Eligible[0];
      const kdef = KIT_DEFS[kid];
      options.push({
        type: 'kit_tier', id: `kit_tier_${kid}_2`, rarity: 'rare',
        icon: kdef?.icon ?? 'K', label: `${kdef?.name ?? kid} Tier 2`,
        desc: '+1 max HP (tier upgrade)', kitId: kid, newTier: 2,
      });
      slot2Done = true;
    }
  }

  if (!slot2Done) {
    // Fallback: random modifier for slot 2
    const usedIds = new Set(state.modifiersTaken);
    for (const o of options) if (o.type === 'modifier') usedIds.add(o.id);
    const avail = shuffle(MODIFIER_DEFS.filter(m => !usedIds.has(m.id)));
    if (avail.length > 0) {
      const m = avail[0];
      options.push({
        type: 'modifier', id: m.id, rarity: m.rarity,
        icon: m.rarity === 'rare' ? '★' : '◆', label: m.name, desc: m.desc,
      });
    }
  }

  // ── Slot 3: MODIFIER ──
  {
    const usedIds = new Set(state.modifiersTaken);
    for (const o of options) if (o.type === 'modifier') usedIds.add(o.id);
    const avail = shuffle(MODIFIER_DEFS.filter(m => !usedIds.has(m.id)));
    if (avail.length > 0) {
      const m = avail[0];
      options.push({
        type: 'modifier', id: m.id, rarity: m.rarity,
        icon: m.rarity === 'rare' ? '★' : '◆', label: m.name, desc: m.desc,
      });
    }
  }

  // ── Kit Perk injection (max 1 per screen) ──
  let bestKitPerk: UpgradeCard | null = null;
  let bestIsRare = false;
  for (const kid of state.equippedKits) {
    const perksForKit = KIT_PERKS[kid] ?? [];
    for (const kp of perksForKit) {
      if (state.kitPerksTaken.includes(kp.id)) continue;
      const isRare = kp.rarity === 'rare';
      if (!bestKitPerk || (isRare && !bestIsRare) || (isRare === bestIsRare && Math.random() < 0.5)) {
        bestKitPerk = {
          type: 'kit_perk', id: kp.id, rarity: kp.rarity,
          icon: kp.icon, label: kp.name, desc: kp.desc,
          kitId: kid,
        };
        bestIsRare = isRare;
      }
    }
  }
  if (bestKitPerk) {
    options.push(bestKitPerk);
  }

  // ─�� Guaranteed fallbacks so panel is never empty ──
  if (options.length < 3) {
    const fallbacks: UpgradeCard[] = [
      { type: 'fallback', id: 'hp_restore',    rarity: 'common', icon: 'H', label: 'Field Medkit',    desc: 'Restore 3 HP immediately' },
      { type: 'fallback', id: 'void_drain_f',  rarity: 'common', icon: 'D', label: 'Void Drain',      desc: 'Killing void enemies reduces corruption by 3' },
      { type: 'fallback', id: 'pack_hunter_f', rarity: 'common', icon: 'P', label: 'Pack Awareness',  desc: '+8% damage per enemy within 200px' },
      { type: 'fallback', id: 'corr_purge',    rarity: 'rare',   icon: 'P', label: 'Void Purge',      desc: 'Reduce corruption by 20' },
    ];
    const existingIds = new Set(options.map(o => o.id));
    for (const fb of shuffle(fallbacks)) {
      if (options.length >= 3) break;
      if (!existingIds.has(fb.id)) {
        options.push(fb);
        existingIds.add(fb.id);
      }
    }
  }

  // Cap at 3 cards (+ possible kit perk = 4 max)
  // First 3 are the main slots, 4th is kit perk if present
  if (options.length > 4) {
    // Keep first card (weapon), then pick best remaining
    return options.slice(0, 4);
  }

  return options;
}
