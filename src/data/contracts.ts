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
}

const CONTRACT_NAMES: Record<string, string[]> = {
  hunt:           ['Void Sweep', 'Infestation Clear', 'Perimeter Purge', 'Dead Zone Recon'],
  payload_escort: ['Supply Run', 'Cargo Extraction', 'Pod Delivery', 'Emergency Resupply'],
  void_breach:    ['Rift Containment', 'Void Seal', 'Breach Lockdown', 'Dimensional Hold'],
  boss_hunt:      ['Apex Target', 'Priority Kill', 'Named Bounty', 'Alpha Elimination'],
  extraction_run: ['Cache Sweep', 'Ingredient Run', 'Biome Harvest', 'Supply Scavenge'],
};

export function generateContracts(count: number = 3): Contract[] {
  const types = [...CONTRACT_TYPES].sort(() => Math.random() - 0.5).slice(0, count);
  return types.map(type => {
    const def = CONTRACT_TYPE_DEFS[type];
    const difficulty = 1 + Math.floor(Math.random() * 4);
    const names = CONTRACT_NAMES[type] || ['Unknown Mission'];
    return {
      type,
      label: def.label,
      name: names[Math.floor(Math.random() * names.length)],
      desc: def.desc,
      difficulty,
      reward: 30 + difficulty * 20 + Math.floor(Math.random() * 20),
      specialReward: difficulty >= 4 ? '+1 Elite Core' : '',
      iconColor: def.iconColor,
      targetTotal: 3 + difficulty * 2,
    };
  });
}
