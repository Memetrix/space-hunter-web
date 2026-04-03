import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REP_THRESHOLDS } from '../data/recipes';

export interface SaveState {
  totalCredits: number;
  totalCorruption: number;
  contractsCompleted: number;
  pantry: Record<string, number>;
  shipUpgrades: Record<string, number>;
  unlockedWeapons: string[];
  equippedKits: string[];
  kitTiers: Record<string, number>;
  unlockedKits: string[];
  kitT3Choices: Record<string, string>;
  kitT2Paths: Record<string, string>;
  activeBonuses: Record<string, boolean | number>;
  unlockedRecipes: string[];
  reputation: Record<string, number>;
  introSeen: boolean;
  endowedProgress: boolean;
}

export interface SaveActions {
  completeContract: (credits: number, corruption: number) => void;
  buyUpgrade: (id: string, cost: number, maxLevel: number) => boolean;
  unlockWeapon: (id: string, cost: number) => boolean;
  unlockKit: (id: string, cost: number) => void;
  upgradeKitTier: (id: string, newTier: number, cost: number) => void;
  assignKit: (kitId: string, slot: number) => void;
  addIngredients: (items: Array<{ id: string }>) => void;
  cookRecipe: (cost: Record<string, number>, track: string, rep: number, bonus: string, quality?: number) => void;
  getRepLevel: (track: string) => number;
  getAvailableWeapons: () => string[];
  markIntroSeen: () => void;
  endowProgress: () => void;
}

const DEFAULT_PANTRY: Record<string, number> = {
  rift_dust: 0, void_crystal: 0, cave_moss: 0, river_silt: 0, elite_core: 0,
};

/** Map creature drops → pantry ingredient types */
const DROP_TO_PANTRY: Record<string, string> = {
  void_extract: 'void_crystal',
  void_core: 'void_crystal',
  shadow_membrane: 'rift_dust',
  nether_bile: 'rift_dust',
  abyss_flesh: 'cave_moss',
  cave_crystal: 'cave_moss',
  rift_spore: 'river_silt',
  tide_essence: 'river_silt',
  cache_loot: 'elite_core',
};

export const useSaveStore = create<SaveState & SaveActions>()(
  persist(
    (set, get) => ({
      // State
      totalCredits: 0,
      totalCorruption: 0,
      contractsCompleted: 0,
      pantry: { ...DEFAULT_PANTRY },
      shipUpgrades: { max_hp: 0, mag_size: 0, xp_rate: 0, loadout_slots: 0 },
      unlockedWeapons: ['sidearm'],
      equippedKits: ['stim_pack', 'flash_trap'],
      kitTiers: { stim_pack: 1, flash_trap: 1 },
      unlockedKits: ['stim_pack', 'flash_trap'],
      kitT3Choices: {},
      kitT2Paths: {},
      activeBonuses: {},
      unlockedRecipes: ['field_ration', 'void_brew', 'cave_jerky', 'silt_stew'],
      reputation: { contractor: 0, void_walker: 0, tactician: 0, scrapper: 0 },
      introSeen: false,
      endowedProgress: false,

      // Actions
      completeContract: (credits, corruption) => set(s => ({
        totalCredits: s.totalCredits + credits,
        totalCorruption: s.totalCorruption + corruption,
        contractsCompleted: s.contractsCompleted + 1,
      })),

      buyUpgrade: (id, cost, maxLevel) => {
        const s = get();
        const level = s.shipUpgrades[id] ?? 0;
        if (level >= maxLevel || s.totalCredits < cost) return false;
        set({
          totalCredits: s.totalCredits - cost,
          shipUpgrades: { ...s.shipUpgrades, [id]: level + 1 },
        });
        return true;
      },

      unlockWeapon: (id, cost) => {
        const s = get();
        if (s.unlockedWeapons.includes(id) || s.totalCredits < cost) return false;
        set({
          totalCredits: s.totalCredits - cost,
          unlockedWeapons: [...s.unlockedWeapons, id],
        });
        return true;
      },

      unlockKit: (id, cost) => {
        const s = get();
        if (s.totalCredits < cost) return;
        set({
          totalCredits: s.totalCredits - cost,
          unlockedKits: [...s.unlockedKits, id],
          kitTiers: { ...s.kitTiers, [id]: 1 },
        });
      },

      upgradeKitTier: (id, newTier, cost) => {
        const s = get();
        if (s.totalCredits < cost) return;
        set({
          totalCredits: s.totalCredits - cost,
          kitTiers: { ...s.kitTiers, [id]: newTier },
        });
      },

      assignKit: (kitId, slot) => {
        const s = get();
        const eq = [...s.equippedKits];
        while (eq.length < 2) eq.push('');
        const other = 1 - slot;
        if (eq[other] === kitId) eq[other] = eq[slot];
        eq[slot] = kitId;
        set({ equippedKits: eq });
      },

      addIngredients: (items) => set(s => {
        const pantry = { ...s.pantry };
        for (const item of items) {
          const raw = item.id.replace('ingredient_', '');
          const key = DROP_TO_PANTRY[raw] ?? raw;
          pantry[key] = (pantry[key] ?? 0) + 1;
        }
        return { pantry };
      }),

      cookRecipe: (cost, track, rep, bonus, quality = 1) => set(s => {
        const pantry = { ...s.pantry };
        for (const [k, v] of Object.entries(cost)) {
          pantry[k] = (pantry[k] ?? 0) - v;
        }
        const multiplier = quality >= 3 ? 2 : quality >= 2 ? 1.5 : 1;
        const reputation = { ...s.reputation };
        reputation[track] = (reputation[track] ?? 0) + Math.round(rep * multiplier);
        const bonuses = { ...s.activeBonuses };
        if (bonus) bonuses[bonus] = true;
        return { pantry, reputation, activeBonuses: bonuses };
      }),

      getRepLevel: (track) => {
        const pts = get().reputation[track] ?? 0;
        let level = 0;
        for (let i = REP_THRESHOLDS.length - 1; i >= 0; i--) {
          if (pts >= REP_THRESHOLDS[i]) { level = i; break; }
        }
        return level;
      },

      getAvailableWeapons: () => get().unlockedWeapons,

      markIntroSeen: () => set({ introSeen: true }),

      endowProgress: () => set(s => {
        if (s.endowedProgress) return {};
        const rep = { ...s.reputation };
        for (const t of ['contractor', 'void_walker', 'tactician', 'scrapper']) {
          rep[t] = (rep[t] ?? 0) + 5;
        }
        const pantry = { ...s.pantry };
        for (const i of ['rift_dust', 'void_crystal', 'cave_moss', 'river_silt']) {
          pantry[i] = (pantry[i] ?? 0) + 1;
        }
        return { reputation: rep, pantry, endowedProgress: true };
      }),
    }),
    { name: 'space_hunter_save' }
  )
);
