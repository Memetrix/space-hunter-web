import { type Vec2, v2, v2add, v2mul, v2norm, v2sub, v2dist, v2len, v2fromAngle, randRange } from '../lib/math';
import { WEAPON_DEFS, type WeaponDef } from '../data/weapons';
import { BULLET_MAX_COUNT } from './constants';
import type { Player } from './Player';

export interface Bullet {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  color: number;
  damage: number;
  life: number;
  maxLife: number;
  piercing: boolean;
  homing: boolean;
  bounces: number;
  aoeRadius: number;
  fromPlayer: boolean;
  hitSet: Set<number>; // enemy IDs already hit
}

export class WeaponSystem {
  bullets: Bullet[] = [];

  fire(player: Player): Bullet[] {
    const def = WEAPON_DEFS[player.weaponId];
    if (!def) return [];
    if (player.fireCooldown > 0) return [];
    if (player.reloadTimer > 0) return [];
    if (player.magAmmo <= 0 && def.magSize < 999) {
      player.reloadTimer = def.reloadTime;
      return [];
    }

    player.fireCooldown = def.fireRate;
    if (def.magSize < 999) player.magAmmo--;

    const newBullets = this.createBullets(player.pos, player.aimAngle, def);
    this.bullets.push(...newBullets);

    // Auto-reload on empty
    if (player.magAmmo <= 0 && def.magSize < 999) {
      player.reloadTimer = def.reloadTime;
    }

    // Cap bullet count
    while (this.bullets.length > BULLET_MAX_COUNT) this.bullets.shift();

    return newBullets;
  }

  private createBullets(pos: Vec2, angle: number, def: WeaponDef): Bullet[] {
    const makeBullet = (a: number, opts: Partial<Bullet> = {}): Bullet => ({
      pos: v2(pos.x, pos.y),
      vel: v2fromAngle(a, def.bulletSpeed),
      radius: def.bulletRadius,
      color: def.color,
      damage: def.damage,
      life: def.range / Math.max(def.bulletSpeed, 1),
      maxLife: def.range / Math.max(def.bulletSpeed, 1),
      piercing: false,
      homing: false,
      bounces: 0,
      aoeRadius: 0,
      fromPlayer: true,
      hitSet: new Set(),
      ...opts,
    });

    switch (def.pattern) {
      case 'single':
        return [makeBullet(angle)];

      case 'scatter': {
        const count = 5;
        const spread = 0.4;
        return Array.from({ length: count }, (_, i) => {
          const a = angle - spread / 2 + (spread / (count - 1)) * i + randRange(-0.05, 0.05);
          return makeBullet(a);
        });
      }

      case 'piercing':
        return [makeBullet(angle, { piercing: true })];

      case 'melee_aoe':
        return [makeBullet(angle, {
          vel: v2(0, 0),
          life: 0.2,
          maxLife: 0.2,
          aoeRadius: def.range,
        })];

      case 'homing':
        return [makeBullet(angle, { homing: true, life: 3.0, maxLife: 3.0 })];

      case 'cone_stream': {
        const a = angle + randRange(-0.3, 0.3);
        return [makeBullet(a, { life: 0.5, maxLife: 0.5 })];
      }

      case 'arc_aoe':
        return [makeBullet(angle, { aoeRadius: 80, life: def.range / def.bulletSpeed })];

      case 'bounce':
        return [makeBullet(angle, { bounces: 3 })];

      default:
        return [makeBullet(angle)];
    }
  }

  update(dt: number, enemies: Array<{ pos: Vec2; id: number }>) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= dt;
      if (b.life <= 0) { this.bullets.splice(i, 1); continue; }

      // Homing
      if (b.homing && enemies.length > 0) {
        let nearest = enemies[0];
        let nearDist = v2dist(b.pos, nearest.pos);
        for (let e = 1; e < enemies.length; e++) {
          const d = v2dist(b.pos, enemies[e].pos);
          if (d < nearDist) { nearest = enemies[e]; nearDist = d; }
        }
        const toTarget = v2norm(v2sub(nearest.pos, b.pos));
        const speed = v2len(b.vel);
        const currentDir = v2norm(b.vel);
        const blend = v2norm(v2add(v2mul(currentDir, 0.8), v2mul(toTarget, 0.2)));
        b.vel = v2mul(blend, speed);
      }

      b.pos = v2add(b.pos, v2mul(b.vel, dt));
    }
  }

  /** Check bullet-enemy collision. Returns damage dealt, removes bullet if not piercing. */
  checkHit(bullet: Bullet, enemyId: number, enemyPos: Vec2, enemyRadius: number): number {
    if (bullet.hitSet.has(enemyId)) return 0;
    const dist = v2dist(bullet.pos, enemyPos);
    const hitRange = bullet.aoeRadius > 0 ? bullet.aoeRadius : bullet.radius + enemyRadius;
    if (dist > hitRange) return 0;

    bullet.hitSet.add(enemyId);
    if (!bullet.piercing && bullet.aoeRadius === 0) {
      if (bullet.bounces > 0) {
        bullet.bounces--;
        // Reflect in random direction
        const a = Math.atan2(bullet.vel.y, bullet.vel.x) + randRange(-1, 1);
        const spd = v2len(bullet.vel);
        bullet.vel = v2fromAngle(a, spd);
      } else {
        bullet.life = 0; // Mark for removal
      }
    }
    return bullet.damage;
  }

  clear() { this.bullets = []; }
}
