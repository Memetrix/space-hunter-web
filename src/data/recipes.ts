export interface Recipe {
  id: string;
  displayName: string;
  tier: number;
  track: string;
  cost: Record<string, number>;
  rep: number;
  bonus: string;
}

export const RECIPES: Record<string, Recipe> = {
  field_ration:      { id: 'field_ration',      displayName: 'Field Ration',       tier: 1, track: 'contractor',  cost: { rift_dust: 1 },                 rep: 10, bonus: '' },
  void_brew:         { id: 'void_brew',         displayName: 'Void Brew',          tier: 1, track: 'void_walker', cost: { void_crystal: 1 },               rep: 10, bonus: '' },
  cave_jerky:        { id: 'cave_jerky',        displayName: 'Cave Jerky',         tier: 1, track: 'tactician',   cost: { cave_moss: 1 },                  rep: 10, bonus: '' },
  silt_stew:         { id: 'silt_stew',         displayName: 'Silt Stew',          tier: 1, track: 'scrapper',    cost: { river_silt: 1 },                 rep: 10, bonus: '' },
  silt_cured_meat:   { id: 'silt_cured_meat',   displayName: 'Silt-Cured Meat',    tier: 2, track: 'contractor',  cost: { river_silt: 2 },                 rep: 25, bonus: 'credits_boost' },
  void_infusion:     { id: 'void_infusion',     displayName: 'Void Infusion',      tier: 2, track: 'void_walker', cost: { void_crystal: 2 },               rep: 25, bonus: 'start_corrupted' },
  cave_broth:        { id: 'cave_broth',        displayName: 'Cave Broth',         tier: 2, track: 'tactician',   cost: { cave_moss: 2 },                  rep: 25, bonus: 'trap_charge' },
  gland_tonic:       { id: 'gland_tonic',       displayName: 'Gland Tonic',        tier: 2, track: 'scrapper',    cost: { rift_dust: 2 },                  rep: 25, bonus: 'stim_boost' },
  purified_extract:  { id: 'purified_extract',  displayName: 'Purified Extract',   tier: 3, track: 'contractor',  cost: { elite_core: 1, river_silt: 1 },  rep: 60, bonus: 'reveal_elites' },
  void_communion:    { id: 'void_communion',     displayName: 'Void Communion',     tier: 3, track: 'void_walker', cost: { elite_core: 1, void_crystal: 1 }, rep: 60, bonus: 'early_mutation' },
  tactical_compound: { id: 'tactical_compound', displayName: 'Tactical Compound',  tier: 3, track: 'tactician',   cost: { elite_core: 1, cave_moss: 1 },   rep: 60, bonus: 'kit_charge_all' },
  ironblood_draught: { id: 'ironblood_draught', displayName: 'Ironblood Draught',  tier: 3, track: 'scrapper',    cost: { elite_core: 1, rift_dust: 1 },   rep: 60, bonus: 'temp_hp' },
};

export const BONUS_DESCS: Record<string, string> = {
  credits_boost: '+20% credits next hunt',
  start_corrupted: 'Start at corruption 10',
  trap_charge: '+1 trap charge next hunt',
  stim_boost: 'Stim cooldown -20% next hunt',
  reveal_elites: 'Reveal elite spawns on map',
  early_mutation: 'Void mutation from Lv4',
  kit_charge_all: 'All kits +1 charge',
  temp_hp: 'Start with 30 temp HP',
};

export const TRACK_ORDER = ['contractor', 'void_walker', 'tactician', 'scrapper'] as const;

export const TRACK_COLORS: Record<string, number> = {
  contractor: 0x44cc44,
  void_walker: 0xaa44ff,
  tactician: 0x4d80e6,
  scrapper: 0xff8844,
};

export const PANTRY_COLORS: Record<string, number> = {
  rift_dust: 0xe6cc4d,
  void_crystal: 0xaa44ff,
  cave_moss: 0x4db366,
  river_silt: 0x4d99e6,
  elite_core: 0xffd900,
};

export const REP_THRESHOLDS = [0, 50, 150, 350, 700, 1200];
