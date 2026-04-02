import { Application, Container, Graphics, Sprite, Assets, Texture } from 'pixi.js';
import { Camera } from './Camera';
import { GameMap } from './Map';
import { Player } from './Player';
import { WeaponSystem } from './Weapons';
import { EnemySystem, type Enemy } from './Enemies';
import { HUD } from './HUD';
import { v2dist } from '../lib/math';
import { PLAYER_BASE_HP, PLAYER_BASE_SPEED, WORLD_W, WORLD_H, PLAYER_COLOR, XP_PER_LEVEL, MAX_LEVEL } from './constants';
import { CREATURE_DEFS } from '../data/creatures';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
import { type ModifierDef, rollModifiers } from '../data/modifiers';
import {
  halSay,
  HAL_HUNT_START, HAL_WAVE_INCOMING, HAL_FIRST_KILL, HAL_KILL_STREAK,
  HAL_ELITE_SPAWNED, HAL_LOW_HP, HAL_CRITICAL_HP, HAL_TOOK_DAMAGE,
  HAL_CORRUPTION_VALLEY, HAL_CORRUPTION_CORRUPT, HAL_CORRUPTION_VOID,
  HAL_OBJECTIVE_HALF, HAL_OBJECTIVE_NEAR,
  HAL_LEVEL_UP, HAL_PLAYER_DIED, HAL_CONTRACT_DONE,
  HAL_RELOAD,
} from '../data/hal';

// Sprite base path for GitHub Pages support
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Sprite name → creature name mapping
const CREATURE_SPRITE_MAP: Record<string, string> = {
  'Void Leech': 'void_leech',
  'Shadow Crawler': 'shadow_crawler',
  'Abyss Worm': 'abyss_worm',
  'Nether Stalker': 'nether_stalker',
  'Rift Parasite': 'rift_parasite',
  'Cave Lurker': 'cave_lurker',
  'Tide Wraith': 'tide_wraith',
  'Void Spawn': 'void_spawn',
};

// 8-direction system — PixelLab order matches atan2 when we flip east/west
// atan2(vy,vx): 0=right, PI/2=down, PI=left, -PI/2=up
// Map: index 0=east(right), 1=SE, 2=south(down), 3=SW, 4=west(left), 5=NW, 6=north(up), 7=NE
const DIR_NAMES = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'] as const;

/** Convert velocity to one of 8 direction names */
function angleTo8Dir(vx: number, vy: number): string {
  if (vx === 0 && vy === 0) return 'south';
  // atan2 gives: 0=right, +PI/2=down, ±PI=left, -PI/2=up
  const angle = Math.atan2(vy, vx);
  // Normalize to 0..2PI then quantize to 8 sectors
  const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const sector = Math.round(norm / (Math.PI / 4)) % 8;
  return DIR_NAMES[sector];
}

// Sprites that have 8-direction folders
const SPRITES_WITH_DIRS = ['player', 'void_leech', 'shadow_crawler', 'abyss_worm', 'nether_stalker', 'cave_lurker', 'tide_wraith'];

export interface GameCallbacks {
  onDeath: () => void;
  onComplete: () => void;
  onHuntResult: (result: {
    credits: number; corruption: number; timeSurvived: number;
    totalKills: number; eliteKills: number; apexKills: number;
    peakCorruption: number; damageDealt: number; damageTaken: number;
    ingredients: Array<{ id: string; name: string }>;
  }) => void;
  /** Called between waves to let the player pick a modifier. Game is paused until resolved. */
  onModifierPick: (choices: ModifierDef[], resolve: (picked: ModifierDef) => void) => void;
}

export class Game {
  app: Application;
  camera: Camera;
  map: GameMap;
  player: Player;
  weapons: WeaponSystem;
  enemies: EnemySystem;
  hud: HUD;
  callbacks: GameCallbacks;

  // Layers
  worldLayer: Container;
  mapGfx: Graphics;
  dynamicGfx: Graphics;
  obstacleLayer: Container;
  entityGfx: Graphics;
  bulletGfx: Graphics;
  spriteLayer: Container;
  hudLayer: Container;

  // Sprite textures: key = "name/direction" for stills, "name/walk/direction/N" for anim frames
  textures: Record<string, Texture> = {};
  spritePool: Map<number, Sprite> = new Map();
  playerSprite: Sprite | null = null;
  animFrame = 0;       // global animation frame counter
  animTimer = 0;       // time accumulator for frame stepping
  animFPS = 8;         // animation playback speed

  // Kit state
  kitCooldowns: Record<string, number> = {};

  // State
  elapsed = 0;
  waveTimer = 15;
  waveCount = 0;
  totalKills = 0;
  eliteKills = 0;
  damageDealt = 0;
  damageTaken = 0;
  peakCorruption = 0;
  ingredients: Array<{ id: string; name: string }> = [];
  paused = false;
  dead = false;
  complete = false;
  equippedKits: string[] = [];
  contractType = 'hunt';
  targetTotal = 10;
  targetCount = 0;
  hpBonus = 0;
  magBonus = 0;

  // Contract-specific state
  holdTime = 0;          // void_breach: seconds remaining
  holdTimer = 0;         // void_breach: seconds held so far
  holdZoneActive = false; // void_breach: player in hold zone
  podHp = 0;             // payload_escort: pod HP
  podMaxHp = 0;
  podProgress = 0;       // payload_escort: 0→1 delivery progress
  cacheCount = 0;        // extraction_run: total caches
  cachesCollected = 0;   // extraction_run: collected so far

  // Kit cooldown tracking
  kitCooldowns: Record<string, number> = {};

  // Active modifiers
  activeModifiers: string[] = [];
  modifierPickPending = false;     // true while waiting for player to choose
  adrenalineKills = 0;             // kills within 3s window for adrenaline
  adrenalineTimer = 0;
  adrenalineStacks = 0;
  momentumHits = 0;                // consecutive hits for momentum
  killsSinceLastHeal = 0;          // counter for vamp

  // HAL event tracking
  halCooldown = 0;              // global cooldown between HAL messages
  halReloadSaid = false;        // don't spam reload messages
  halLowHpSaid = false;         // one low-HP warning per danger window
  halCriticalHpSaid = false;
  halCorruptionValleySaid = false;
  halCorruptionCorruptSaid = false;
  halCorruptionVoidSaid = false;
  halKillStreakTimer = 0;       // comment on sustained killing
  halKillsSinceStreak = 0;
  halHalfSaid = false;
  halNearSaid = false;

  constructor(
    app: Application, kits: string[], contractType: string, targetTotal: number,
    hpBonus: number, magBonus: number, callbacks: GameCallbacks,
    contractExtras?: { holdTime?: number; podHp?: number; cacheCount?: number }
  ) {
    this.app = app;
    this.callbacks = callbacks;
    this.equippedKits = kits;
    this.contractType = contractType;
    this.targetTotal = targetTotal;
    this.hpBonus = hpBonus;
    this.magBonus = magBonus;

    // Initialize kit cooldowns
    for (const kit of kits) {
      this.kitCooldowns[kit] = 0;
    }

    // Contract-specific init
    if (contractExtras?.holdTime) {
      this.holdTime = contractExtras.holdTime;
    }
    if (contractExtras?.podHp) {
      this.podHp = contractExtras.podHp;
      this.podMaxHp = contractExtras.podHp;
    }
    if (contractExtras?.cacheCount) {
      this.cacheCount = contractExtras.cacheCount;
    }

    const vw = app.screen.width;
    const vh = app.screen.height;

    this.camera = new Camera(vw, vh);
    this.map = new GameMap();
    this.map.generate();

    const maxHp = PLAYER_BASE_HP + hpBonus * 2;
    const magSize = 12 + magBonus * 3;
    this.player = new Player(this.map.spawnPos.x, this.map.spawnPos.y, maxHp, magSize);
    this.weapons = new WeaponSystem();
    this.enemies = new EnemySystem();
    this.hud = new HUD(vw, vh);

    // Build scene graph
    this.worldLayer = new Container();
    this.mapGfx = new Graphics();
    this.dynamicGfx = new Graphics();
    this.obstacleLayer = new Container();
    this.spriteLayer = new Container();
    this.entityGfx = new Graphics();
    this.bulletGfx = new Graphics();
    this.hudLayer = new Container();

    this.worldLayer.addChild(this.mapGfx);
    this.worldLayer.addChild(this.dynamicGfx);
    this.worldLayer.addChild(this.obstacleLayer);
    this.worldLayer.addChild(this.spriteLayer);
    this.worldLayer.addChild(this.entityGfx);
    this.worldLayer.addChild(this.bulletGfx);

    app.stage.addChild(this.worldLayer);
    app.stage.addChild(this.hudLayer);

    // Load sprite textures (non-blocking)
    this.loadSprites();
    this.hudLayer.addChild(this.hud.gfx);
    this.hudLayer.addChild(this.hud.hpText);
    this.hudLayer.addChild(this.hud.ammoText);
    this.hudLayer.addChild(this.hud.weaponText);
    this.hudLayer.addChild(this.hud.corrText);
    this.hudLayer.addChild(this.hud.killsText);
    this.hudLayer.addChild(this.hud.timerText);
    this.hudLayer.addChild(this.hud.levelText);
    this.hudLayer.addChild(this.hud.messageText);
    this.hudLayer.addChild(this.hud.halStripText);

    // Draw static map
    this.map.drawStatic(this.mapGfx);

    // Spawn initial wave
    this.enemies.spawnWave(15, this.player.pos, this.map);
    this.hud.showMessage('HUNT STARTED', 2);
    setTimeout(() => this.hud.showHalMessage(halSay(HAL_HUNT_START), 5), 2500);

    // Input
    this.setupInput();
  }

  private async loadSprites() {
    const ANIM_NAMES: Record<string, string> = {
      player: 'walking', void_leech: 'running-4-frames', shadow_crawler: 'running-4-frames',
      abyss_worm: 'running-4-frames', nether_stalker: 'running-4-frames', cave_lurker: 'running-4-frames',
    };
    const FRAME_COUNTS: Record<string, number> = {
      player: 6, void_leech: 4, shadow_crawler: 4, abyss_worm: 4, nether_stalker: 4, cave_lurker: 4,
    };

    const loadBatch = async (batch: Array<{ key: string; url: string }>) => {
      const results = await Promise.allSettled(
        batch.map(async ({ key, url }) => {
          const tex = await Assets.load(url);
          return { key, tex };
        })
      );
      for (const r of results) {
        if (r.status === 'fulfilled') this.textures[r.value.key] = r.value.tex;
      }
    };

    // Phase 1: rotation stills + singles + obstacles — game starts after these
    const phase1: Array<{ key: string; url: string }> = [];
    for (const name of SPRITES_WITH_DIRS) {
      for (const dir of DIR_NAMES) {
        phase1.push({ key: `${name}/${dir}`, url: `${BASE}/sprites/${name}/${dir}.png` });
      }
    }
    for (const name of ['rift_parasite', 'void_spawn', 'bullet_player', 'bullet_enemy', 'hal_eye', 'explosion', 'essence_orb']) {
      phase1.push({ key: name, url: `${BASE}/sprites/${name}.png` });
    }
    // Obstacle sprites
    for (const name of ['obs_asteroid', 'obs_crystal', 'obs_debris']) {
      phase1.push({ key: name, url: `${BASE}/sprites/obstacles/${name}.png` });
    }
    await loadBatch(phase1);

    // Create player sprite
    const playerTex = this.textures['player/south'];
    if (playerTex) {
      this.playerSprite = new Sprite(playerTex);
      this.playerSprite.anchor.set(0.5, 0.5);
      this.playerSprite.scale.set(2);
      this.playerSprite.roundPixels = true;
      this.spriteLayer.addChild(this.playerSprite);
    }

    // Place obstacle sprites
    const OBS_KEYS = ['obs_asteroid', 'obs_crystal', 'obs_debris'];
    for (const obs of this.map.obstacles) {
      const key = OBS_KEYS[obs.obsType] ?? OBS_KEYS[0];
      const tex = this.textures[key];
      if (!tex) continue;
      const spr = new Sprite(tex);
      spr.anchor.set(0.5, 0.5);
      spr.x = obs.pos.x;
      spr.y = obs.pos.y;
      // Scale sprite to match obstacle size
      const scaleX = obs.w / 64;
      const scaleY = obs.h / 64;
      spr.scale.set(Math.max(scaleX, scaleY));
      spr.roundPixels = true;
      // Random rotation for variety
      spr.rotation = Math.random() * Math.PI * 2;
      this.obstacleLayer.addChild(spr);
    }

    // Phase 2: animation frames in background
    const phase2: Array<{ key: string; url: string }> = [];
    for (const name of SPRITES_WITH_DIRS) {
      const animName = ANIM_NAMES[name] || 'walking';
      const frames = FRAME_COUNTS[name] || 6;
      for (const dir of DIR_NAMES) {
        for (let f = 0; f < frames; f++) {
          const fStr = String(f).padStart(3, '0');
          phase2.push({ key: `${name}/anim/${dir}/${f}`, url: `${BASE}/sprites/${name}/${animName}/${dir}/frame_${fStr}.png` });
        }
      }
    }
    loadBatch(phase2); // intentionally not awaited
  }

  private getOrCreateEnemySprite(enemy: Enemy): Sprite | null {
    const texBase = CREATURE_SPRITE_MAP[enemy.name];
    if (!texBase) return null;

    // Determine direction from velocity
    const dir = angleTo8Dir(enemy.vel.x, enemy.vel.y);
    const dirKey = `${texBase}/${dir}`;
    const fallbackKey = `${texBase}/south`;
    const singleKey = texBase; // for sprites without 8-dirs (rift_parasite, void_spawn)

    const tex = this.textures[dirKey] || this.textures[fallbackKey] || this.textures[singleKey];
    if (!tex) return null;

    if (this.spritePool.has(enemy.id)) {
      const spr = this.spritePool.get(enemy.id)!;
      spr.texture = tex; // swap direction texture
      return spr;
    }

    const spr = new Sprite(tex);
    spr.anchor.set(0.5, 0.5);
    spr.scale.set(2);
    spr.roundPixels = true;
    this.spriteLayer.addChild(spr);
    this.spritePool.set(enemy.id, spr);
    return spr;
  }

  private cleanupDeadSprites() {
    const alive = new Set(this.enemies.enemies.map(e => e.id));
    for (const [id, spr] of this.spritePool) {
      if (!alive.has(id)) {
        this.spriteLayer.removeChild(spr);
        spr.destroy();
        this.spritePool.delete(id);
      }
    }
  }

  private setupInput() {
    const canvas = this.app.canvas;

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.player.onTouchStart(t.clientX - rect.left, t.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.player.onTouchMove(t.clientX - rect.left, t.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.player.onTouchEnd();
    }, { passive: false });

    // Keyboard
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down) {
        this.player.onKeyDown(e.key);
        // Handle kit activation (Q = stim pack)
        if (e.key.toLowerCase() === 'q') {
          this.activateKit('stim_pack');
        }
      } else {
        this.player.onKeyUp(e.key);
      }
    };
    window.addEventListener('keydown', (e) => {
      if (e.key === 'q' || e.key === 'Q') this.activateKit('stim_pack');
      onKey(e, true);
    });
    window.addEventListener('keyup', (e) => onKey(e, false));
  }

  private activateKit(kitId: string) {
    if (!this.equippedKits.includes(kitId)) return;
    if (this.kitCooldowns[kitId] && this.kitCooldowns[kitId] > 0) return;

    if (kitId === 'stim_pack') {
      // Heal 4 HP, add 15 corruption
      this.player.hp = Math.min(this.player.hp + 4, this.player.maxHp);
      this.player.corruption = Math.min(100, this.player.corruption + 15);
      this.kitCooldowns['stim_pack'] = 8;
      this.hud.showMessage('STIM USED', 1.5);
    }
  }

  update(dt: number) {
    if (this.dead || this.complete || this.paused) return;
    this.elapsed += dt;

    // Animation frame stepping
    this.animTimer += dt;
    if (this.animTimer >= 1 / this.animFPS) {
      this.animTimer -= 1 / this.animFPS;
      this.animFrame++;
    }

    // Decrement kit cooldowns
    for (const kit of Object.keys(this.kitCooldowns)) {
      if (this.kitCooldowns[kit] > 0) {
        this.kitCooldowns[kit] -= dt;
      }
    }

    // Player update
    this.player.update(dt, this.map);
    this.peakCorruption = Math.max(this.peakCorruption, this.player.corruption);

    // HAL commentary cooldown
    if (this.halCooldown > 0) this.halCooldown -= dt;
    this.halKillStreakTimer = Math.max(0, this.halKillStreakTimer - dt);

    // HAL: HP warnings
    const hpFrac = this.player.hp / this.player.maxHp;
    if (hpFrac < 0.15 && !this.halCriticalHpSaid) {
      this.halCriticalHpSaid = true;
      this.halLowHpSaid = true;
      this.hud.showHalMessage(halSay(HAL_CRITICAL_HP), 4);
      this.halCooldown = 8;
    } else if (hpFrac < 0.35 && !this.halLowHpSaid && this.halCooldown <= 0) {
      this.halLowHpSaid = true;
      this.hud.showHalMessage(halSay(HAL_LOW_HP), 4);
      this.halCooldown = 10;
    } else if (hpFrac > 0.6) {
      // Reset warnings when healed
      this.halLowHpSaid = false;
      this.halCriticalHpSaid = false;
    }

    // HAL: Corruption thresholds
    const c = this.player.corruption;
    if (c >= 70 && !this.halCorruptionVoidSaid && this.halCooldown <= 0) {
      this.halCorruptionVoidSaid = true;
      this.hud.showHalMessage(halSay(HAL_CORRUPTION_VOID), 5);
      this.halCooldown = 12;
    } else if (c >= 36 && !this.halCorruptionCorruptSaid && this.halCooldown <= 0) {
      this.halCorruptionCorruptSaid = true;
      this.hud.showHalMessage(halSay(HAL_CORRUPTION_CORRUPT), 5);
      this.halCooldown = 10;
    } else if (c >= 16 && !this.halCorruptionValleySaid && this.halCooldown <= 0) {
      this.halCorruptionValleySaid = true;
      this.hud.showHalMessage(halSay(HAL_CORRUPTION_VALLEY), 4);
      this.halCooldown = 8;
    }

    // HAL: Reload commentary (rare, not every reload)
    if (this.player.reloadTimer > 0 && !this.halReloadSaid && Math.random() < 0.12 && this.halCooldown <= 0) {
      this.halReloadSaid = true;
      this.hud.showHalMessage(halSay(HAL_RELOAD), 2);
      this.halCooldown = 6;
    } else if (this.player.reloadTimer <= 0) {
      this.halReloadSaid = false;
    }

    // HAL: Objective progress
    if (!this.halHalfSaid && this.targetCount >= Math.floor(this.targetTotal * 0.5) && this.targetTotal > 0 && this.halCooldown <= 0) {
      this.halHalfSaid = true;
      this.hud.showHalMessage(halSay(HAL_OBJECTIVE_HALF), 4);
      this.halCooldown = 6;
    } else if (!this.halNearSaid && this.targetCount >= Math.floor(this.targetTotal * 0.75) && this.targetTotal > 0 && this.halCooldown <= 0) {
      this.halNearSaid = true;
      this.hud.showHalMessage(halSay(HAL_OBJECTIVE_NEAR), 4);
      this.halCooldown = 6;
    }

    // HAL: Kill streak (fires if kills happen in rapid succession)
    if (this.halKillsSinceStreak >= 5 && this.halKillStreakTimer <= 0 && this.halCooldown <= 0) {
      this.halKillsSinceStreak = 0;
      this.hud.showHalMessage(halSay(HAL_KILL_STREAK), 3);
      this.halCooldown = 8;
    }

    // HAL: took damage (detect hit flash transition, random chance to comment)
    if (this.player.hitFlash > 0.12 && this.halCooldown <= 0 && Math.random() < 0.18) {
      this.hud.showHalMessage(halSay(HAL_TOOK_DAMAGE), 2);
      this.halCooldown = 4;
    }

    // Kit cooldowns
    for (const k of Object.keys(this.kitCooldowns)) {
      if (this.kitCooldowns[k] > 0) this.kitCooldowns[k] -= dt;
    }

    // Camera
    this.camera.follow(this.player.pos, dt);

    // Find nearest enemy for auto-aim
    let nearestDist = Infinity;
    for (const e of this.enemies.enemies) {
      const d = v2dist(this.player.pos, e.pos);
      if (d < nearestDist && d < 400) {
        nearestDist = d;
        this.player.nearestEnemyPos = e.pos;
      }
    }
    if (nearestDist === Infinity) this.player.nearestEnemyPos = null;

    // Auto-fire when enemies in range
    if (this.player.nearestEnemyPos) {
      this.weapons.fire(this.player);
    }

    // Enemies update
    this.enemies.update(dt, this.player, this.map);

    // Player bullets update
    this.weapons.update(dt, this.enemies.enemies.map(e => ({ pos: e.pos, id: e.id })));

    // Bullet-enemy collision
    for (const bullet of this.weapons.bullets) {
      if (!bullet.fromPlayer) continue;
      for (const enemy of this.enemies.enemies) {
        const dmg = this.weapons.checkHit(bullet, enemy.id, enemy.pos, enemy.radius);
        if (dmg > 0) {
          enemy.hp -= dmg;
          enemy.hitFlash = 0.1;
          enemy.isAggroed = true;
          this.damageDealt += dmg;

          if (enemy.hp <= 0) {
            this.onEnemyKilled(enemy);
          }
        }
      }
    }

    // Remove dead enemies
    this.enemies.enemies = this.enemies.enemies.filter(e => e.hp > 0);

    // Remove expired bullets
    this.weapons.bullets = this.weapons.bullets.filter(b => b.life > 0);

    // Adrenaline timer (for modifier)
    if (this.adrenalineTimer > 0) {
      this.adrenalineTimer -= dt;
      if (this.adrenalineTimer <= 0) this.adrenalineKills = 0;
    }

    // Waves
    this.waveTimer -= dt;
    if (this.waveTimer <= 0 && this.enemies.enemies.length < 50 && !this.modifierPickPending) {
      this.waveCount++;
      const count = 10 + this.waveCount * 3 + Math.floor(this.elapsed / 60) * 2;
      this.enemies.spawnWave(Math.min(count, 30), this.player.pos, this.map);
      this.waveTimer = Math.max(8, 20 - this.waveCount * 1.5);
      this.hud.showMessage(`WAVE ${this.waveCount + 1}`, 1.5);
      if (this.halCooldown <= 0) {
        setTimeout(() => this.hud.showHalMessage(halSay(HAL_WAVE_INCOMING), 3), 600);
        this.halCooldown = 5;
      }

      // Offer modifier pick every 2nd wave (wave 2, 4, 6...)
      if (this.waveCount > 0 && this.waveCount % 2 === 0 && this.activeModifiers.length < 6) {
        this.offerModifierPick();
      }
    }

    // Death check
    if (this.player.hp <= 0 && !this.dead) {
      this.dead = true;
      this.hud.showMessage('YOU DIED', 3);
      this.hud.showHalMessage(halSay(HAL_PLAYER_DIED), 4);
      setTimeout(() => this.finishHunt('FAILED'), 2000);
    }

    // ── Contract-type-specific updates & completion ──

    // VOID BREACH: hold zone timer
    if (this.contractType === 'void_breach' && !this.complete) {
      // Player must stay near center of map (simplified hold zone)
      const cx = WORLD_W / 2, cy = WORLD_H / 2;
      const distToCenter = v2dist(this.player.pos, { x: cx, y: cy });
      this.holdZoneActive = distToCenter < 300;
      if (this.holdZoneActive) {
        this.holdTimer += dt;
        // Corruption builds faster in hold zone
        this.player.corruption = Math.min(100, this.player.corruption + 3.0 * this.player.corruptionResistMult * dt);
      }
      if (this.holdTimer >= this.holdTime) {
        this.complete = true;
        this.hud.showMessage('BREACH SEALED', 2);
        this.hud.showHalMessage(halSay(HAL_CONTRACT_DONE), 5);
        setTimeout(() => this.finishHunt('COMPLETED'), 2000);
      }
    }

    // PAYLOAD ESCORT: pod moves toward exit, player must stay near
    if (this.contractType === 'payload_escort' && !this.complete) {
      const podSpeed = 40; // px/s
      const nearPlayer = v2dist(this.player.pos, { x: WORLD_W * this.podProgress, y: WORLD_H / 2 }) < 250;
      if (nearPlayer && this.podHp > 0) {
        this.podProgress += (podSpeed / WORLD_W) * dt;
      }
      if (this.podProgress >= 1) {
        this.complete = true;
        this.hud.showMessage('POD DELIVERED', 2);
        this.hud.showHalMessage(halSay(HAL_CONTRACT_DONE), 5);
        setTimeout(() => this.finishHunt('COMPLETED'), 2000);
      }
      if (this.podHp <= 0 && !this.complete) {
        this.hud.showMessage('POD DESTROYED', 2);
        setTimeout(() => this.finishHunt('FAILED'), 2000);
      }
    }

    // HUNT & BOSS HUNT: kill target count
    if ((this.contractType === 'hunt' || this.contractType === 'boss_hunt') && this.targetCount >= this.targetTotal && !this.complete) {
      this.complete = true;
      this.hud.showMessage('CONTRACT COMPLETE', 2);
      this.hud.showHalMessage(halSay(HAL_CONTRACT_DONE), 5);
      setTimeout(() => this.finishHunt('COMPLETED'), 2000);
    }

    // EXTRACTION RUN: collect caches (simplified — caches spawn as special map points)
    if (this.contractType === 'extraction_run' && this.cachesCollected >= this.cacheCount && this.cacheCount > 0 && !this.complete) {
      this.complete = true;
      this.hud.showMessage('CACHES COLLECTED', 2);
      this.hud.showHalMessage(halSay(HAL_CONTRACT_DONE), 5);
      setTimeout(() => this.finishHunt('COMPLETED'), 2000);
    }

    // Dynamic map
    this.map.drawDynamic(this.dynamicGfx, this.elapsed);

    // Update sprites
    this.updateSprites();
    this.cleanupDeadSprites();

    // Draw entity overlays (glow, HP bars, aim line)
    this.drawEntities();

    // Draw bullets
    this.drawBullets();

    // Update camera on world layer
    this.worldLayer.x = -this.camera.x;
    this.worldLayer.y = -this.camera.y;

    // HUD
    this.hud.draw(this.player, dt, this.totalKills, this.elapsed, this.equippedKits);
  }

  private onEnemyKilled(enemy: Enemy) {
    this.totalKills++;
    this.targetCount++;
    this.player.essenceCollected++;
    this.halKillsSinceStreak++;
    this.halKillStreakTimer = 4; // reset 4s streak window

    // ── Modifier effects on kill ──
    const isVoidEnemy = enemy.voidType;

    // Void Hunger: kill void → +1 HP
    if (this.hasMod('void_hunger') && isVoidEnemy) {
      this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
    }

    // Void Drain: kill void → −3 corruption
    if (this.hasMod('void_drain') && isVoidEnemy) {
      this.player.corruption = Math.max(0, this.player.corruption - 3);
    }

    // Scavenger: ingredient drops also give +1 essence
    if (this.hasMod('scavenger')) {
      this.player.essenceCollected++;
    }

    // Vamp: 1 in 5 kills → +1 HP
    if (this.hasMod('vamp')) {
      this.killsSinceLastHeal++;
      if (this.killsSinceLastHeal >= 5) {
        this.killsSinceLastHeal = 0;
        this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
      }
    }

    // Adrenaline: 3 kills in 3s → +5% speed stack
    if (this.hasMod('adrenaline')) {
      this.adrenalineKills++;
      this.adrenalineTimer = 3;
      if (this.adrenalineKills >= 3) {
        this.adrenalineStacks++;
        this.adrenalineKills = 0;
      }
    }

    // Momentum: reset on miss (handled in bullet code), but we track consecutive
    if (this.hasMod('momentum')) {
      this.momentumHits++;
    }

    // HAL: first kill
    if (this.totalKills === 1 && this.halCooldown <= 0) {
      this.hud.showHalMessage(halSay(HAL_FIRST_KILL), 3);
      this.halCooldown = 5;
    }

    // HAL: elite kill announcement
    if (enemy.isElite && this.halCooldown <= 0) {
      this.hud.showHalMessage(halSay(HAL_ELITE_SPAWNED), 3);
      this.halCooldown = 6;
    }

    // Check level up
    if (this.player.level < MAX_LEVEL) {
      const threshold = XP_PER_LEVEL[this.player.level] ?? 999;
      if (this.player.essenceCollected >= threshold) {
        this.player.level++;
        this.player.essenceCollected = 0;
        this.hud.showMessage(`LEVEL ${this.player.level}!`, 1.5);
        setTimeout(() => this.hud.showHalMessage(halSay(HAL_LEVEL_UP), 4), 1000);
        // Simple stat boost on level
        this.player.maxHp += 1;
        this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
      }
    }

    // Drop ingredient
    const def = CREATURE_DEFS[enemy.name];
    if (def && Math.random() < 0.3) {
      this.ingredients.push({ id: `ingredient_${def.ingredient.id}`, name: def.ingredient.name });
    }

    if (enemy.isElite) this.eliteKills++;
  }

  private updateSprites() {
    const isMoving = Math.abs(this.player.vel.x) > 5 || Math.abs(this.player.vel.y) > 5;

    // Player sprite
    if (this.playerSprite) {
      this.playerSprite.x = this.player.pos.x;
      this.playerSprite.y = this.player.pos.y;
      this.playerSprite.alpha = this.player.iFrames > 0 ? 0.4 : 1;
      this.playerSprite.rotation = 0;

      let dir: string;
      if (isMoving) {
        dir = angleTo8Dir(this.player.vel.x, this.player.vel.y);
      } else if (this.player.nearestEnemyPos) {
        dir = angleTo8Dir(this.player.nearestEnemyPos.x - this.player.pos.x, this.player.nearestEnemyPos.y - this.player.pos.y);
      } else {
        dir = 'south';
      }

      // Use animation frame if moving, else still
      if (isMoving) {
        const animTex = this.textures[`player/anim/${dir}/${this.animFrame % 6}`];
        if (animTex) this.playerSprite.texture = animTex;
        else {
          const still = this.textures[`player/${dir}`];
          if (still) this.playerSprite.texture = still;
        }
      } else {
        const still = this.textures[`player/${dir}`];
        if (still) this.playerSprite.texture = still;
      }

      this.playerSprite.tint = this.player.hitFlash > 0 ? 0xff2200 : 0xffffff;
    }

    // Enemy sprites
    for (const e of this.enemies.enemies) {
      const spr = this.getOrCreateEnemySprite(e);
      if (!spr) continue;
      spr.x = e.pos.x;
      spr.y = e.pos.y;
      spr.visible = this.camera.isVisible(e.pos.x, e.pos.y, e.radius * 2);
      spr.tint = e.hitFlash > 0 ? 0xff4444 : 0xffffff;

      // Swap to animation frame if enemy is moving
      const eMoving = Math.abs(e.vel.x) > 3 || Math.abs(e.vel.y) > 3;
      const texBase = CREATURE_SPRITE_MAP[e.name];
      if (texBase && eMoving) {
        const dir = angleTo8Dir(e.vel.x, e.vel.y);
        const animTex = this.textures[`${texBase}/anim/${dir}/${this.animFrame % 4}`];
        if (animTex) spr.texture = animTex;
      }
    }
  }

  private drawEntities() {
    const g = this.entityGfx;
    g.clear();
    const px = this.player.pos.x, py = this.player.pos.y, pr = this.player.radius;
    const pAlpha = this.player.iFrames > 0 ? 0.4 : 1;
    const hit = this.player.hitFlash > 0;

    // Player glow ring (always drawn, even with sprite)
    g.circle(px, py, pr * 2.2).fill({ color: 0x0066aa, alpha: 0.06 * pAlpha });
    g.circle(px, py, pr * 1.5).stroke({ color: 0x00aaff, width: 1, alpha: 0.2 * pAlpha });

    // Geometric fallback only if no sprite
    if (!this.playerSprite) {
      const d = pr * 0.9;
      g.moveTo(px, py - d).lineTo(px + d, py).lineTo(px, py + d).lineTo(px - d, py).closePath();
      g.fill({ color: hit ? 0xff2200 : 0x00ccff, alpha: 0.7 * pAlpha });
      g.moveTo(px, py - d).lineTo(px + d, py).lineTo(px, py + d).lineTo(px - d, py).closePath();
      g.stroke({ color: hit ? 0xff4400 : 0x44eeff, width: 2, alpha: pAlpha });
      g.circle(px, py, 3).fill({ color: 0xffffff, alpha: 0.9 * pAlpha });
    }

    // Aim line — laser targeting
    if (this.player.nearestEnemyPos) {
      const dist = 50;
      const ax = px + Math.cos(this.player.aimAngle) * dist;
      const ay = py + Math.sin(this.player.aimAngle) * dist;
      g.moveTo(px, py).lineTo(ax, ay).stroke({ color: 0xff2200, width: 1, alpha: 0.4 });
      // Targeting reticle
      g.circle(ax, ay, 4).stroke({ color: 0xff2200, width: 1, alpha: 0.6 });
    }

    // Enemies — sprite + glow overlays
    for (const e of this.enemies.enemies) {
      if (!this.camera.isVisible(e.pos.x, e.pos.y, e.radius * 2)) continue;
      const ex = e.pos.x, ey = e.pos.y, er = e.radius * 1.5;
      const col = e.hitFlash > 0 ? 0xffffff : e.color;
      const isVoid = e.voidType;
      const hasSprite = this.spritePool.has(e.id);

      // Outer detection ring (when aggroed)
      if (e.isAggroed) {
        g.circle(ex, ey, er * 1.6).stroke({ color: col, width: 0.5, alpha: 0.15 });
      }

      // Geometric fallback only when no sprite loaded
      if (hasSprite) {
        // Just draw glow and HP bar, skip shape
      } else if (e.behavior === 'charge' || e.behavior === 'pack') {
        // Triangle (aggressive)
        g.moveTo(ex, ey - er).lineTo(ex + er * 0.87, ey + er * 0.5).lineTo(ex - er * 0.87, ey + er * 0.5).closePath();
        g.fill({ color: col, alpha: 0.6 });
        g.moveTo(ex, ey - er).lineTo(ex + er * 0.87, ey + er * 0.5).lineTo(ex - er * 0.87, ey + er * 0.5).closePath();
        g.stroke({ color: col, width: 1.5, alpha: 0.9 });
      } else if (e.behavior === 'strafe' || e.behavior === 'patrol_river') {
        // Hexagon (ranged)
        for (let i = 0; i < 6; i++) {
          const a1 = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
          if (i === 0) g.moveTo(ex + Math.cos(a1) * er, ey + Math.sin(a1) * er);
          g.lineTo(ex + Math.cos(a2) * er, ey + Math.sin(a2) * er);
        }
        g.closePath().fill({ color: col, alpha: 0.4 });
        for (let i = 0; i < 6; i++) {
          const a1 = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
          if (i === 0) g.moveTo(ex + Math.cos(a1) * er, ey + Math.sin(a1) * er);
          g.lineTo(ex + Math.cos(a2) * er, ey + Math.sin(a2) * er);
        }
        g.closePath().stroke({ color: col, width: 1.5, alpha: 0.8 });
      } else if (e.behavior === 'lurker') {
        // X shape (ambusher)
        g.moveTo(ex - er, ey - er).lineTo(ex + er, ey + er).stroke({ color: col, width: 3, alpha: 0.7 });
        g.moveTo(ex + er, ey - er).lineTo(ex - er, ey + er).stroke({ color: col, width: 3, alpha: 0.7 });
      } else {
        // Default: square (standard)
        g.rect(ex - er * 0.7, ey - er * 0.7, er * 1.4, er * 1.4).fill({ color: col, alpha: 0.5 });
        g.rect(ex - er * 0.7, ey - er * 0.7, er * 1.4, er * 1.4).stroke({ color: col, width: 1.5, alpha: 0.8 });
      }

      // Void type inner glow
      if (isVoid) {
        g.circle(ex, ey, er * 0.4).fill({ color: 0xff2200, alpha: 0.5 + Math.sin(this.elapsed * 4) * 0.2 });
      }

      // HP bar — thin red line
      if (e.hp < e.maxHp) {
        const bw = er * 2.5;
        const bh = 3;
        const bx = ex - bw / 2;
        const by = ey - er - 10;
        const frac = e.hp / e.maxHp;
        g.rect(bx, by, bw, bh).fill({ color: 0x110000, alpha: 0.8 });
        g.rect(bx, by, bw * frac, bh).fill({ color: 0xff2200, alpha: 0.9 });
      }
    }
  }

  private drawBullets() {
    const g = this.bulletGfx;
    g.clear();

    // Player bullets — glowing projectiles
    for (const b of this.weapons.bullets) {
      if (!this.camera.isVisible(b.pos.x, b.pos.y, b.radius * 3)) continue;
      // Glow trail
      g.circle(b.pos.x, b.pos.y, b.radius * 3).fill({ color: b.color, alpha: 0.1 });
      // Core
      g.circle(b.pos.x, b.pos.y, b.radius * 1.5).fill({ color: b.color, alpha: 0.8 });
      g.circle(b.pos.x, b.pos.y, b.radius * 0.8).fill({ color: 0xffffff, alpha: 0.6 });
    }

    // Enemy bullets — red threat indicators
    for (const b of this.enemies.enemyBullets) {
      if (!this.camera.isVisible(b.pos.x, b.pos.y, b.radius * 3)) continue;
      g.circle(b.pos.x, b.pos.y, b.radius * 2.5).fill({ color: 0xff0000, alpha: 0.12 });
      g.circle(b.pos.x, b.pos.y, b.radius * 1.5).fill({ color: 0xff2200, alpha: 0.8 });
      g.circle(b.pos.x, b.pos.y, b.radius * 0.6).fill({ color: 0xff8866, alpha: 0.9 });
    }
  }

  /** Pause game and let player pick a modifier */
  private offerModifierPick() {
    const choices = rollModifiers(3, this.activeModifiers);
    if (choices.length === 0) return;
    this.modifierPickPending = true;
    this.paused = true;
    this.callbacks.onModifierPick(choices, (picked) => {
      this.applyModifier(picked);
      this.modifierPickPending = false;
      this.paused = false;
    });
  }

  /** Apply a picked modifier's instant effects */
  private applyModifier(mod: ModifierDef) {
    this.activeModifiers.push(mod.id);
    switch (mod.id) {
      case 'tough':
        this.player.maxHp += 3;
        this.player.hp = this.player.maxHp;
        break;
      case 'speed':
        this.player.baseSpeed += 25;
        break;
      case 'magplus':
        this.player.magSize += 4;
        break;
      case 'dodge':
        this.player.dodgeChance = 0.1;
        break;
      case 'corruption_resist':
        this.player.corruptionResistMult = 0.75;
        break;
      case 'reload':
        // Handled in weapon fire logic via hasMod check
        break;
    }
    this.hud.showMessage(`+ ${mod.name.toUpperCase()}`, 2);
  }

  /** Check if a modifier is active */
  hasMod(id: string): boolean { return this.activeModifiers.includes(id); }

  /** Get damage multiplier from active modifiers */
  getModDamageMult(enemy: { isElite?: boolean; targetingPlayer?: boolean }): number {
    let mult = 1;
    if (this.hasMod('elite_dmg') && enemy.isElite) mult *= 1.3;
    if (this.hasMod('stalker') && !enemy.targetingPlayer) mult *= 1.4;
    if (this.hasMod('pack_hunter')) {
      const nearby = this.enemies.enemies.filter(e => v2dist(this.player.pos, e.pos) < 200).length;
      mult *= 1 + nearby * 0.08;
    }
    if (this.hasMod('last_stand') && this.player.hp < 3) mult *= 1.5;
    if (this.hasMod('precision') && this.player.justReloaded) mult *= 2;
    if (this.hasMod('momentum')) mult *= 1 + this.momentumHits * 0.15;
    return mult;
  }

  /** Get speed multiplier from active modifiers */
  getModSpeedMult(): number {
    let mult = 1;
    if (this.hasMod('last_stand') && this.player.hp < 3) mult *= 1.3;
    if (this.hasMod('adrenaline')) mult *= 1 + this.adrenalineStacks * 0.05;
    return mult;
  }

  activateKit(kitId: string) {
    if (!this.equippedKits.includes(kitId)) return;
    if ((this.kitCooldowns[kitId] || 0) > 0) return;
    if (kitId === 'stim_pack') {
      this.player.heal(4);
      this.player.corruption = Math.min(100, this.player.corruption + 15);
      this.kitCooldowns[kitId] = 8;
      this.hud.showMessage('STIM USED', 1.5);
    }
  }

  finishHunt(status: 'COMPLETED' | 'FAILED' | 'ABANDONED') {
    const credits = Math.floor(this.totalKills * 5 + (status === 'COMPLETED' ? 50 : 10));
    this.callbacks.onHuntResult({
      credits,
      corruption: Math.floor(this.player.corruption),
      timeSurvived: this.elapsed,
      totalKills: this.totalKills,
      eliteKills: this.eliteKills,
      apexKills: 0,
      peakCorruption: this.peakCorruption,
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken,
      ingredients: this.ingredients,
    });
  }

  destroy() {
    this.app.stage.removeChild(this.worldLayer);
    this.app.stage.removeChild(this.hudLayer);
    this.worldLayer.destroy({ children: true });
    this.hudLayer.destroy({ children: true });
  }
}
