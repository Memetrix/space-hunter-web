export const ELITE_TYPES = [
  'Void Hulk', 'Phase Hunter', 'Brood Mother', 'Rift Colossus',
  'Null Wraith', 'Stone Sentinel', 'Tide Reaper', 'Current Stalker',
] as const;

export const APEX_TYPES = [
  'Rift Sovereign', 'The Hollow', 'Ancient Brood', 'Abyssal Tide',
] as const;

export interface EliteStatOverride {
  hp: number;
  speed: number;
  radius: number;
  color: number;
  meleeDmg: number;
  ranged: boolean;
  rangedDmg: number;
}

export const ELITE_OVERRIDES: Partial<Record<string, Partial<EliteStatOverride>>> = {
  'Rift Colossus':   { hp: 250, speed: 40,  radius: 35, color: 0x4d0080 },
  'Null Wraith':     { hp: 90,  speed: 110, radius: 12, color: 0x331a4d },
  'Stone Sentinel':  { hp: 200, speed: 0,   radius: 22, color: 0x808080 },
  'Tide Reaper':     { hp: 120, speed: 70,  radius: 16, color: 0x1a3399 },
  'Current Stalker': { hp: 80,  speed: 85,  radius: 14, color: 0x00ccb3 },
};

export const ELITE_EPITHETS = [
  'the Ravenous', 'the Hollow', 'the Undying', 'the Silent',
  'of the Deep', 'the Blighted', 'the Forsaken', 'Worldbreaker',
  'the Devourer', 'Nightcrawler', 'the Consuming', 'Voidborn',
];
