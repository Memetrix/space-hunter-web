/**
 * Upgrade generation system — pool-based with rarity weighting.
 *
 * Builds a pool of ALL available upgrades, assigns priority weights,
 * then picks 3 cards weighted by rarity and type diversity.
 * Each screen should feel different.
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
  weaponId?: string;
  mutationType?: 'clean' | 'void';
  kitId?: string;
  newTier?: number;
  perkEffect?: string;
  perkValue?: number | boolean;
}

export interface ProgressionState {
  weaponId: string;
  weaponLevel: number;
  weaponMutated: boolean;
  weaponMutationType: string;
  corruption: number;
  equippedKits: string[];
  kitTiers: Record<string, number>;
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

/** Weighted random pick: higher weight = more likely to be chosen */
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const RARITY_WEIGHT: Record<UpgradeRarity, number> = {
  legendary: 5,
  rare: 3,
  common: 1.5,
};

const TYPE_WEIGHT: Record<UpgradeType, number> = {
  mutation: 6,
  resonance: 5,
  mastery: 4,
  weapon_upgrade: 3,
  kit_tier: 3,
  kit_perk: 2.5,
  modifier: 1,
  fallback: 0.5,
};

export function generateUpgrades(state: ProgressionState): UpgradeCard[] {
  const pool: UpgradeCard[] = [];
  const { weaponId, weaponLevel, weaponMutated, weaponMutationType, corruption } = state;
  const usedModIds = new Set(state.modifiersTaken);

  // ── WEAPON CARDS ──

  if (weaponLevel >= 5 && !weaponMutated && WEAPON_MUTATIONS[weaponId]) {
    // Mutation fork
    if (corruption < 35) {
      const mut = WEAPON_MUTATIONS[weaponId].clean;
      pool.push({
        type: 'mutation', id: `mut_${weaponId}_clean`, rarity: 'legendary',
        icon: mut.icon, label: mut.name, desc: mut.desc,
        weaponId, mutationType: 'clean',
      });
    }
    if (corruption > 20) {
      const mut = WEAPON_MUTATIONS[weaponId].void;
      pool.push({
        type: 'mutation', id: `mut_${weaponId}_void`, rarity: 'legendary',
        icon: mut.icon, label: mut.name, desc: mut.desc,
        weaponId, mutationType: 'void',
      });
    }
  } else if (weaponLevel < 5) {
    // Next weapon perk
    const nextLevel = weaponLevel + 1;
    const perks = WEAPON_LEVEL_PERKS[weaponId];
    if (perks && perks[nextLevel]) {
      const perk = perks[nextLevel];
      const wdef = WEAPON_DEFS[weaponId];
      pool.push({
        type: 'weapon_upgrade', id: `wperk_${weaponId}_${nextLevel}`,
        rarity: nextLevel >= 4 ? 'rare' : 'common',
        icon: perk.icon, label: `${wdef?.name ?? weaponId} — ${perk.name}`, desc: perk.desc,
        weaponId, perkEffect: perk.effect, perkValue: perk.value,
      });
    } else {
      const wdef = WEAPON_DEFS[weaponId];
      pool.push({
        type: 'weapon_upgrade', id: `wperk_${weaponId}_${weaponLevel + 1}`,
        rarity: 'common', icon: 'W',
        label: `${wdef?.name ?? weaponId} Lv${weaponLevel + 1}`, desc: '+1 damage',
        weaponId, perkEffect: 'damage', perkValue: 1,
      });
    }
    // Also add a generic weapon stat boost as alternative
    const wdef = WEAPON_DEFS[weaponId];
    pool.push({
      type: 'modifier', id: 'mastery_dmg', rarity: 'common',
      icon: 'W', label: `${wdef?.name ?? weaponId}: Raw Power`, desc: '+2 damage',
    });
  } else if (weaponMutated) {
    // Mastery perks
    const masteryPool = WEAPON_MASTERY[weaponId]?.[weaponMutationType];
    if (masteryPool) {
      const available = shuffle(masteryPool.filter(mp => !state.masteryTaken.includes(mp.id)));
      // Add up to 2 mastery options
      for (const perk of available.slice(0, 2)) {
        pool.push({
          type: 'mastery', id: perk.id, rarity: 'rare',
          icon: perk.icon, label: perk.name, desc: perk.desc, weaponId,
        });
      }
    }
    if (pool.length === 0) {
      const wdef = WEAPON_DEFS[weaponId];
      pool.push({
        type: 'modifier', id: 'mastery_dmg', rarity: 'common',
        icon: 'W', label: `Mastery: ${wdef?.name ?? weaponId}`, desc: '+2 damage',
      });
    }
  }

  // ── KIT CARDS ──

  // Kit tier upgrades
  for (const kid of state.equippedKits) {
    const kt = state.kitTiers[kid] ?? 1;
    if (kt === 2 && !state.kitT3Pending.includes(kid)) {
      state.kitT3Pending.push(kid);
    } else if (kt < 2) {
      const kdef = KIT_DEFS[kid];
      pool.push({
        type: 'kit_tier', id: `kit_tier_${kid}_2`, rarity: 'rare',
        icon: kdef?.icon ?? 'K', label: `${kdef?.name ?? kid} Tier 2`,
        desc: '+1 max HP (tier upgrade)', kitId: kid, newTier: 2,
      });
    }
  }

  // Kit perks (all available, not just best)
  for (const kid of state.equippedKits) {
    const perksForKit = KIT_PERKS[kid] ?? [];
    for (const kp of perksForKit) {
      if (state.kitPerksTaken.includes(kp.id)) continue;
      pool.push({
        type: 'kit_perk', id: kp.id, rarity: kp.rarity,
        icon: kp.icon, label: kp.name, desc: kp.desc, kitId: kid,
      });
    }
  }

  // Resonance
  const bothT3 = state.equippedKits.length >= 2 &&
    (state.kitTiers[state.equippedKits[0]] ?? 1) >= 3 &&
    (state.kitTiers[state.equippedKits[1]] ?? 1) >= 3;
  if (bothT3) {
    for (const rp of RESONANCE_POOL) {
      if (state.resonanceTaken.includes(rp.id)) continue;
      if (!rp.kits.every(k => state.equippedKits.includes(k))) continue;
      pool.push({
        type: 'resonance', id: rp.id, rarity: 'legendary',
        icon: rp.icon, label: rp.name, desc: rp.desc,
      });
    }
  }

  // ── MODIFIERS (add several for variety) ──
  const availMods = shuffle(MODIFIER_DEFS.filter(m => !usedModIds.has(m.id)));
  for (const m of availMods.slice(0, 4)) {
    pool.push({
      type: 'modifier', id: m.id, rarity: m.rarity,
      icon: m.rarity === 'rare' ? '★' : '◆', label: m.name, desc: m.desc,
    });
  }

  // ── FALLBACKS (always available) ──
  const fallbacks: UpgradeCard[] = [
    { type: 'fallback', id: 'hp_restore',    rarity: 'common', icon: '❤', label: 'Field Medkit',   desc: 'Restore 3 HP immediately' },
    { type: 'fallback', id: 'corr_purge',    rarity: 'rare',   icon: 'P', label: 'Void Purge',     desc: 'Reduce corruption by 20' },
  ];
  if (!usedModIds.has('void_drain'))   fallbacks.push({ type: 'fallback', id: 'void_drain_f',  rarity: 'common', icon: 'D', label: 'Void Drain',     desc: 'Killing void enemies reduces corruption by 3' });
  if (!usedModIds.has('pack_hunter'))  fallbacks.push({ type: 'fallback', id: 'pack_hunter_f', rarity: 'common', icon: 'P', label: 'Pack Awareness', desc: '+8% damage per enemy within 200px' });
  pool.push(...fallbacks);

  // ── PICK 3 CARDS with weighted selection + type diversity ──
  if (pool.length <= 3) return pool;

  const picked: UpgradeCard[] = [];
  const remaining = [...pool];
  const pickedTypes = new Set<UpgradeType>();

  for (let i = 0; i < 3 && remaining.length > 0; i++) {
    // Calculate weights: base rarity weight * type weight * diversity bonus
    const weights = remaining.map(card => {
      let w = RARITY_WEIGHT[card.rarity] * TYPE_WEIGHT[card.type];
      // Diversity bonus: strongly prefer types we haven't picked yet
      if (pickedTypes.has(card.type)) w *= 0.15;
      // Don't show two modifiers with same id
      if (picked.some(p => p.id === card.id)) w = 0;
      return w;
    });

    const card = weightedPick(remaining, weights);
    picked.push(card);
    pickedTypes.add(card.type);
    remaining.splice(remaining.indexOf(card), 1);
  }

  // Sort: legendary first, then rare, then common
  const rarityOrder: Record<UpgradeRarity, number> = { legendary: 0, rare: 1, common: 2 };
  picked.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  return picked;
}
