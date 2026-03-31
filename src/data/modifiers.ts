/** Run Modifiers — picked between waves during a hunt */

export type ModifierRarity = 'common' | 'rare';

export interface ModifierDef {
  id: string;
  name: string;
  desc: string;
  rarity: ModifierRarity;
}

export const MODIFIER_DEFS: ModifierDef[] = [
  // ── Common ──
  { id: 'void_hunger',  name: 'Void Hunger',       desc: 'Kill void enemies → heal +1 HP',               rarity: 'common' },
  { id: 'scavenger',    name: 'Scavenger',          desc: 'Ingredient drops also grant +1 essence',       rarity: 'common' },
  { id: 'void_drain',   name: 'Void Drain',         desc: 'Kill void enemies → −3 corruption',            rarity: 'common' },
  { id: 'tough',         name: 'Tough',              desc: '+3 max HP (heal to full)',                     rarity: 'common' },
  { id: 'speed',         name: 'Speed',              desc: '+25 move speed',                               rarity: 'common' },
  { id: 'reload',        name: 'Reload',             desc: 'Reload time −30%',                             rarity: 'common' },
  { id: 'magplus',       name: 'Magplus',            desc: '+4 magazine ammo',                             rarity: 'common' },
  { id: 'pack_hunter',   name: 'Pack Hunter',        desc: '+8% damage per enemy within 200px',           rarity: 'common' },
  // ── Rare ──
  { id: 'adrenaline',    name: 'Adrenaline',         desc: '3 kills in 3s → +5% speed (stacks)',          rarity: 'rare' },
  { id: 'stalker',       name: 'Stalker',            desc: '+40% damage to enemies not targeting you',    rarity: 'rare' },
  { id: 'momentum',      name: 'Momentum',           desc: '+15% bullet speed per consecutive hit',       rarity: 'rare' },
  { id: 'last_stand',    name: 'Last Stand',         desc: 'Below 3 HP → +50% damage, +30% speed',       rarity: 'rare' },
  { id: 'biome_bond',    name: 'Biome Bond',         desc: '+20% damage in starting biome',               rarity: 'rare' },
  { id: 'precision',     name: 'Precision',          desc: 'First shot after reload → 2× damage',        rarity: 'rare' },
  { id: 'dodge',         name: 'Dodge',              desc: '10% chance to dodge a hit',                   rarity: 'rare' },
  { id: 'vamp',          name: 'Vamp',               desc: '1 in 5 kills heals +1 HP',                   rarity: 'rare' },
  { id: 'elite_dmg',     name: 'Elite Dmg',          desc: '+30% damage vs elites',                      rarity: 'rare' },
  { id: 'corruption_resist', name: 'Corruption Resist', desc: 'Corruption gain −25%',                    rarity: 'rare' },
];

/** Pick N random modifiers, weighted: common 3× more likely than rare */
export function rollModifiers(count: number, alreadyPicked: string[]): ModifierDef[] {
  const pool = MODIFIER_DEFS.filter(m => !alreadyPicked.includes(m.id));
  // Build weighted pool
  const weighted: ModifierDef[] = [];
  for (const m of pool) {
    const w = m.rarity === 'common' ? 3 : 1;
    for (let i = 0; i < w; i++) weighted.push(m);
  }
  // Shuffle and deduplicate
  const shuffled = weighted.sort(() => Math.random() - 0.5);
  const picked: ModifierDef[] = [];
  const seen = new Set<string>();
  for (const m of shuffled) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    picked.push(m);
    if (picked.length >= count) break;
  }
  return picked;
}
