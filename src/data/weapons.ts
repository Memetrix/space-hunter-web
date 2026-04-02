export type FiringPattern = 'single' | 'scatter' | 'piercing' | 'melee_aoe' | 'homing' | 'cone_stream' | 'arc_aoe' | 'bounce';

export interface WeaponDef {
  id: string;
  name: string;
  desc: string;
  fireRate: number;
  damage: number;
  bulletSpeed: number;
  bulletRadius: number;
  color: number;
  range: number;
  pattern: FiringPattern;
  magSize: number;
  reloadTime: number;
}

export const WEAPON_DEFS: Record<string, WeaponDef> = {
  sidearm:          { id: 'sidearm',          name: 'Pistol',   desc: 'Balanced semi-auto',        fireRate: 0.45, damage: 2, bulletSpeed: 420, bulletRadius: 4,  color: 0xffcc00, range: 220, pattern: 'single',      magSize: 12, reloadTime: 1.5 },
  scatter:          { id: 'scatter',          name: 'Scatter',  desc: 'Close-range burst',         fireRate: 0.8,  damage: 1, bulletSpeed: 360, bulletRadius: 3,  color: 0xff8844, range: 180, pattern: 'scatter',     magSize: 8,  reloadTime: 1.8 },
  lance:            { id: 'lance',            name: 'Lance',    desc: 'Piercing beam',             fireRate: 1.6,  damage: 5, bulletSpeed: 260, bulletRadius: 5,  color: 0x44ddff, range: 500, pattern: 'piercing',    magSize: 4,  reloadTime: 2.0 },
  baton:            { id: 'baton',            name: 'Baton',    desc: 'Melee AOE',                 fireRate: 1.0,  damage: 3, bulletSpeed: 0,   bulletRadius: 40, color: 0xff4444, range: 90,  pattern: 'melee_aoe',   magSize: 999, reloadTime: 0 },
  dart:             { id: 'dart',             name: 'Dart',     desc: 'Homing shots',              fireRate: 1.1,  damage: 2, bulletSpeed: 180, bulletRadius: 4,  color: 0x44ff66, range: 400, pattern: 'homing',      magSize: 6,  reloadTime: 1.5 },
  flamethrower:     { id: 'flamethrower',     name: 'Flamer',   desc: 'Cone damage',               fireRate: 0.12, damage: 1, bulletSpeed: 180, bulletRadius: 6,  color: 0xff6622, range: 140, pattern: 'cone_stream', magSize: 30, reloadTime: 2.5 },
  grenade_launcher: { id: 'grenade_launcher', name: 'Grenade',  desc: 'Explosive arc',             fireRate: 2.5,  damage: 8, bulletSpeed: 220, bulletRadius: 8,  color: 0xffaa00, range: 300, pattern: 'arc_aoe',     magSize: 2,  reloadTime: 2.0 },
  entropy_cannon:   { id: 'entropy_cannon',   name: 'Entropy',  desc: 'Corruption-scaling damage', fireRate: 2.0,  damage: 3, bulletSpeed: 300, bulletRadius: 6,  color: 0xaa44ff, range: 380, pattern: 'single',      magSize: 5,  reloadTime: 1.8 },
  pulse_cannon:     { id: 'pulse_cannon',     name: 'Pulse',    desc: 'Bouncing projectile',       fireRate: 1.0,  damage: 3, bulletSpeed: 320, bulletRadius: 5,  color: 0x44aaff, range: 350, pattern: 'bounce',      magSize: 8,  reloadTime: 1.5 },
  sniper_carbine:   { id: 'sniper_carbine',   name: 'Sniper',   desc: 'High damage, slow',         fireRate: 2.5,  damage: 8, bulletSpeed: 600, bulletRadius: 3,  color: 0xffffff, range: 600, pattern: 'single',      magSize: 3,  reloadTime: 2.5 },
  chain_rifle:      { id: 'chain_rifle',      name: 'Chain',    desc: 'Rapid suppression',         fireRate: 0.1,  damage: 1, bulletSpeed: 450, bulletRadius: 3,  color: 0x88ffaa, range: 280, pattern: 'single',      magSize: 40, reloadTime: 3.0 },
};

export const ALL_WEAPON_IDS = Object.keys(WEAPON_DEFS);

export const WEAPON_LEVEL_PERKS: Record<string, string[]> = {
  sidearm:          ['dmg+1', 'fire_rate-10%', 'range+30', 'mag+4', 'crit_chance+10%'],
  scatter:          ['pellets+1', 'spread-20%', 'dmg+1', 'range+20', 'knockback'],
  lance:            ['pierce+1', 'dmg+2', 'speed+50', 'range+80', 'burn'],
  baton:            ['radius+20', 'dmg+1', 'speed+15%', 'stun_0.5s', 'lifesteal'],
  dart:             ['homing+30%', 'dmg+1', 'speed+40', 'split', 'poison'],
  flamethrower:     ['cone+20%', 'dmg+1', 'range+30', 'burn_stack', 'spread'],
  grenade_launcher: ['radius+30', 'dmg+3', 'cluster', 'fire_rate-20%', 'napalm'],
  entropy_cannon:   ['corr_scale+20%', 'dmg+2', 'drain', 'aoe_on_kill', 'void_bolt'],
  pulse_cannon:     ['bounce+1', 'dmg+1', 'stun_0.3s', 'speed+60', 'chain_lightning'],
  sniper_carbine:   ['dmg+3', 'headshot+50%', 'pierce', 'fire_rate-15%', 'mark_target'],
  chain_rifle:      ['fire_rate-10%', 'slow+20%', 'dmg+1', 'heat_buildup', 'suppression'],
};
