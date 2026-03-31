export interface ContractTypeDef {
  label: string;
  iconColor: number;
  desc: string;
}

export const CONTRACT_TYPE_DEFS: Record<string, ContractTypeDef> = {
  hunt:            { label: 'Hunt',           iconColor: 0xe64d4d, desc: 'Survive and eliminate targets' },
  payload_escort:  { label: 'Payload Escort', iconColor: 0x4db3e6, desc: 'Protect the cargo pod to the exit' },
  void_breach:     { label: 'Void Breach',    iconColor: 0x9919e6, desc: 'Hold position near the void rift' },
  boss_hunt:       { label: 'Boss Hunt',      iconColor: 0xff8000, desc: 'Find and eliminate a named apex target' },
  extraction_run:  { label: 'Extraction Run', iconColor: 0x33e666, desc: 'Collect ingredient caches across biomes' },
};

export const CONTRACT_TYPES = Object.keys(CONTRACT_TYPE_DEFS);

export interface Contract {
  type: string;
  label: string;
  name: string;
  desc: string;
  difficulty: number;
  reward: number;
  specialReward: string;
  iconColor: number;
  targetTotal: number;
  /** Par time in seconds (for time bonus on results) */
  parTime: number;
  /** Payload HP (payload_escort only) */
  podHp?: number;
  /** Hold duration in seconds (void_breach only) */
  holdTime?: number;
  /** Number of caches to collect (extraction_run only) */
  cacheCount?: number;
}

const CONTRACT_NAMES: Record<string, string[]> = {
  hunt:           ['Void Sweep', 'Infestation Clear', 'Perimeter Purge', 'Dead Zone Recon'],
  payload_escort: ['Supply Run', 'Cargo Extraction', 'Pod Delivery', 'Emergency Resupply'],
  void_breach:    ['Rift Containment', 'Void Seal', 'Breach Lockdown', 'Dimensional Hold'],
  boss_hunt:      ['Apex Target', 'Priority Kill', 'Named Bounty', 'Alpha Elimination'],
  extraction_run: ['Cache Sweep', 'Ingredient Run', 'Biome Harvest', 'Supply Scavenge'],
};

/** Reward formulas per Godot design doc */
function computeReward(type: string, difficulty: number): number {
  switch (type) {
    case 'hunt':           return difficulty * 50 + 10 + Math.floor(Math.random() * 30);
    case 'payload_escort': return 600 + (difficulty - 1) * 100;
    case 'void_breach':    return 500 + (difficulty - 1) * 80;
    case 'boss_hunt':      return 800 + (difficulty - 1) * 120;
    case 'extraction_run': return 700 + (difficulty - 1) * 90;
    default:               return difficulty * 50;
  }
}

function computeSpecial(type: string, difficulty: number): string {
  switch (type) {
    case 'boss_hunt':       return '2× Elite Core + T3 Recipe';
    case 'payload_escort':  return difficulty >= 2 ? '+1 T2 Recipe' : '';
    case 'extraction_run':  return 'All ingredients kept + rep bonus';
    case 'void_breach':     return 'Void Walker rep bonus';
    default:                return difficulty >= 4 ? '+1 Elite Core' : '';
  }
}

export function generateContracts(count: number = 3): Contract[] {
  const types = [...CONTRACT_TYPES].sort(() => Math.random() - 0.5).slice(0, count);
  return types.map(type => {
    const def = CONTRACT_TYPE_DEFS[type];
    const difficulty = 1 + Math.floor(Math.random() * 3); // 1-3
    const names = CONTRACT_NAMES[type] || ['Unknown Mission'];

    const base: Contract = {
      type,
      label: def.label,
      name: names[Math.floor(Math.random() * names.length)],
      desc: def.desc,
      difficulty,
      reward: computeReward(type, difficulty),
      specialReward: computeSpecial(type, difficulty),
      iconColor: def.iconColor,
      targetTotal: 3 + difficulty * 2,
      parTime: 300,
    };

    // Contract-type-specific fields
    switch (type) {
      case 'payload_escort':
        base.podHp = 200 + difficulty * 50;
        base.parTime = 240;
        break;
      case 'void_breach':
        base.holdTime = 120 + difficulty * 30;
        base.parTime = 180;
        base.targetTotal = 0; // no kill target, survive + hold
        break;
      case 'boss_hunt':
        base.parTime = 300;
        base.targetTotal = 1; // kill the apex
        break;
      case 'extraction_run':
        base.cacheCount = 3;
        base.parTime = 360;
        base.targetTotal = 3; // collect 3 caches
        break;
    }

    return base;
  });
}
