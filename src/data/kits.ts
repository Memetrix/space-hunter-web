export interface KitDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cooldown: number;
  charges: number; // -1 = unlimited (cooldown-based)
  unlockCost: number;
  tierCosts: [number, number, number]; // T1 unlock, T2, T3
}

export const KIT_DEFS: Record<string, KitDef> = {
  stim_pack:    { id: 'stim_pack',    name: 'Stim Pack',  icon: 'S', desc: '+4 HP, +15 corruption',       cooldown: 8,  charges: -1, unlockCost: 0,   tierCosts: [0, 60, 120] },
  flash_trap:   { id: 'flash_trap',   name: 'Flash Trap', icon: 'T', desc: 'Stun trap 80px 2s',           cooldown: 0,  charges: 2,  unlockCost: 0,   tierCosts: [0, 80, 160] },
  blink_kit:    { id: 'blink_kit',    name: 'Blink',      icon: 'B', desc: 'Teleport 200px',              cooldown: 10, charges: -1, unlockCost: 120, tierCosts: [120, 100, 200] },
  chain_kit:    { id: 'chain_kit',    name: 'Chain',       icon: 'C', desc: 'Tether enemy 3s',             cooldown: 12, charges: -1, unlockCost: 150, tierCosts: [150, 120, 220] },
  charge_kit:   { id: 'charge_kit',   name: 'Charge',      icon: 'X', desc: 'Knockback blast 150px',       cooldown: 12, charges: -1, unlockCost: 120, tierCosts: [120, 100, 200] },
  mirage_kit:   { id: 'mirage_kit',   name: 'Mirage',      icon: 'M', desc: 'Decoy draws aggro 6s',        cooldown: 18, charges: -1, unlockCost: 180, tierCosts: [180, 140, 260] },
  turret_kit:   { id: 'turret_kit',   name: 'Turret',      icon: 'R', desc: 'Auto-turret 12s',             cooldown: 0,  charges: 1,  unlockCost: 150, tierCosts: [150, 120, 220] },
  smoke_kit:    { id: 'smoke_kit',    name: 'Smoke',       icon: 'K', desc: 'Smoke screen 150px 6s',       cooldown: 14, charges: -1, unlockCost: 100, tierCosts: [100, 80, 180] },
  anchor_kit:   { id: 'anchor_kit',   name: 'Anchor',      icon: 'A', desc: 'Gravity pull 400px 4s',       cooldown: 20, charges: -1, unlockCost: 180, tierCosts: [180, 150, 280] },
  drone_kit:    { id: 'drone_kit',    name: 'Drone',       icon: 'D', desc: 'Intercepts 1 bullet/4s',      cooldown: 0,  charges: -1, unlockCost: 200, tierCosts: [200, 150, 300] },
  familiar_kit: { id: 'familiar_kit', name: 'Familiar',    icon: 'F', desc: 'Void familiar, rams enemies', cooldown: 0,  charges: -1, unlockCost: 160, tierCosts: [160, 130, 250] },
  pack_kit:     { id: 'pack_kit',     name: 'Pack',        icon: 'P', desc: 'Summon 2 allies 15s',         cooldown: 25, charges: -1, unlockCost: 180, tierCosts: [180, 150, 280] },
  void_surge:   { id: 'void_surge',   name: 'Void Surge',  icon: 'V', desc: 'Spend 20 corr: +80% speed 3s', cooldown: 0, charges: -1, unlockCost: 220, tierCosts: [220, 180, 320] },
  rupture_kit:  { id: 'rupture_kit',  name: 'Rupture',     icon: 'U', desc: 'Detonate corruption bar AOE', cooldown: 0,  charges: -1, unlockCost: 250, tierCosts: [250, 200, 380] },
};

export const ALL_KIT_IDS = Object.keys(KIT_DEFS);
